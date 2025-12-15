import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, Image, Package, MessageCircle, Phone, Mail, MapPin, Calendar, Link, Facebook, Instagram, Twitter, Linkedin, Youtube, Smartphone, Edit, Plus, Award, School, Target } from 'lucide-react';
import EditModal from '../../common/EditModal';
import { 
  getStudentProfile, 
  getAllStudentSkills,
  getAllStudentProjects,
  getAllStudentExperience,
  getAllStudentEducation,
  getAllStudentAchievements,
  updateStudentProfile,
  updateStudentSkill,
  updateStudentProject,
  updateStudentExperience,
  updateStudentEducation,
  updateStudentAchievement,
  allStudents,
  createStudentSkill,
  createStudentProject,
  createStudentExperience,
  createStudentEducation,
  createStudentAchievement,
  deleteStudentSkill,
  deleteStudentProject,
  deleteStudentExperience,
  deleteStudentEducation,
  deleteStudentAchievement
} from '../../../utils/Api';

const ViewStudentDetails = () => {
  const { id } = useParams(); // This is the user ID passed from the route
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        
        // Always start by fetching all profiles to get the correct mapping
        const allProfilesResponse = await allStudents();
        if (allProfilesResponse.data.success) {
          const profiles = allProfilesResponse.data.data;
          // Find the matching profile by Profile ID, User ID, or nested User ID
          const matchingProfile = profiles.find(profile => 
            profile._id === id || profile.userId === id || profile.userId?._id === id
          );
          
          if (matchingProfile) {
            setStudentData(matchingProfile);
            
            // Use the user ID from the matching profile for associated data
            const userId = matchingProfile.userId?._id || matchingProfile.userId || id;
            
            // Fetch associated data in parallel
            try {
              // Fetch all associated data in parallel
              const [skillsResponse, projectsResponse, experienceResponse, educationResponse, achievementsResponse] = await Promise.allSettled([
                getAllStudentSkills(),
                getAllStudentProjects(),
                getAllStudentExperience(),
                getAllStudentEducation(),
                getAllStudentAchievements()
              ]);
              
              // Handle skills
              if (skillsResponse.status === 'fulfilled' && skillsResponse.value.data.success) {
                // Filter skills by userId
                const userSkills = skillsResponse.value.data.data.filter(skill => 
                  skill.userId?._id === userId || skill.userId === userId
                );
                setSkills(userSkills);
              }
              
              // Handle projects
              if (projectsResponse.status === 'fulfilled' && projectsResponse.value.data.success) {
                // Filter projects by userId
                const userProjects = projectsResponse.value.data.data.filter(project => 
                  project.userId?._id === userId || project.userId === userId
                );
                setProjects(userProjects);
              }
              
              // Handle experience
              if (experienceResponse.status === 'fulfilled' && experienceResponse.value.data.success) {
                // Filter experience by userId
              
                const userExperience = experienceResponse.value.data.data.filter(exp => 
                  exp.userId?._id === userId || exp.userId === userId
                );
                setExperience(userExperience);
              }
              
              // Handle education
              if (educationResponse.status === 'fulfilled' && educationResponse.value.data.success) {
                // Filter education by userId
                const userEducation = educationResponse.value.data.data.filter(edu => 
                  edu.userId?._id === userId || edu.userId === userId
                );
                setEducation(userEducation);
              }
              
              // Handle achievements
              if (achievementsResponse.status === 'fulfilled' && achievementsResponse.value.data.success) {
                // Filter achievements by userId
                const userAchievements = achievementsResponse.value.data.data.filter(ach => 
                  ach.userId?._id === userId || ach.userId === userId
                );
                setAchievements(userAchievements);
              }
            } catch (err) {
              console.error('Error fetching associated data:', err);
            }
          } else {
            setError('Student profile not found');
          }
        } else {
          setError('Failed to fetch student profiles');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Error fetching student data: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const openEditModal = (section, item = null) => {
    setEditingSection(section);
    setEditingItem(item);
    setEditModalOpen(true);
    setError('');
    setSuccessMessage('');
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingSection('');
    setEditingItem(null);
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      // Use the user ID from the student data, not the profile ID from the route
      const userId = studentData?.userId?._id || studentData?.userId || id;
      const response = await updateStudentProfile(userId, updatedData);
      if (response.data.success) {
        setStudentData(response.data.data);
        setSuccessMessage('Profile updated successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error updating profile: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSaveSkill = async (updatedData) => {
    try {
      // Use the user ID from the student data
      const userId = studentData?.userId?._id || studentData?.userId || id;
      
      let response;
      if (editingItem) {
        // Update existing skill
        response = await updateStudentSkill(editingItem._id, updatedData);
      } else {
        // Create new skill - include userId in the data
        const skillData = { ...updatedData, userId };
        response = await createStudentSkill(skillData);
      }
      
      if (response.data.success) {
        if (editingItem) {
          // Update existing skill in state
          setSkills(skills.map(skill => 
            skill._id === editingItem._id ? response.data.data : skill
          ));
        } else {
          // Add new skill to state
          setSkills([...skills, response.data.data]);
        }
        setSuccessMessage(editingItem ? 'Skill updated successfully' : 'Skill created successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error saving skill: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSaveProject = async (updatedData) => {
    try {
      let response;
      if (editingItem) {
        // Update existing project
        response = await updateStudentProject(editingItem._id, updatedData);
      } else {
        // Create new project - userId is already included in updatedData
        response = await createStudentProject(updatedData);
      }
      
      if (response.data.success) {
        if (editingItem) {
          // Update existing project in state
          setProjects(projects.map(project => 
            project._id === editingItem._id ? response.data.data : project
          ));
        } else {
          // Add new project to state
          setProjects([...projects, response.data.data]);
        }
        setSuccessMessage(editingItem ? 'Project updated successfully' : 'Project created successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error saving project: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSaveAchievement = async (updatedData) => {
    try {
      let response;
      if (editingItem) {
        // Update existing achievement
        response = await updateStudentAchievement(editingItem._id, updatedData);
      } else {
        // Create new achievement - userId is already included in updatedData
        response = await createStudentAchievement(updatedData);
      }
      
      if (response.data.success) {
        if (editingItem) {
          // Update existing achievement in state
          setAchievements(achievements.map(ach => 
            ach._id === editingItem._id ? response.data.data : ach
          ));
        } else {
          // Add new achievement to state
          setAchievements([...achievements, response.data.data]);
        }
        setSuccessMessage(editingItem ? 'Achievement updated successfully' : 'Achievement created successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error saving achievement: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSaveExperience = async (updatedData) => {
    try {
     
      
      // Use the user ID from the student data
      const userId = studentData?.userId?._id || studentData?.userId || id;
      
      let response;
      if (editingItem) {
        response = await updateStudentExperience(editingItem._id, updatedData);
      } else {
        // Create new experience - include userId in the data
        const experienceData = { ...updatedData, userId };
        response = await createStudentExperience(experienceData);
      }
      
      if (response.data.success) {
        if (editingItem) {
          setExperience(prevExperience => {
            const updatedExperience = prevExperience.map(exp => 
              exp._id === editingItem._id ? response.data.data : exp
            );
            return updatedExperience;
          });
        } else {
          setExperience(prevExperience => {
            const newExperience = [...prevExperience, response.data.data];
            
            return newExperience;
          });
        }
        setSuccessMessage(editingItem ? 'Experience updated successfully' : 'Experience created successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error saving experience: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSaveEducation = async (updatedData) => {
    try {
      // Use the user ID from the student data
      const userId = studentData?.userId?._id || studentData?.userId || id;
      
      let response;
      if (editingItem) {
        // Update existing education
        response = await updateStudentEducation(editingItem._id, updatedData);
      } else {
        // Create new education - include userId in the data
        const educationData = { ...updatedData, userId };
        response = await createStudentEducation(educationData);
      }
      
      if (response.data.success) {
        if (editingItem) {
          // Update existing education in state
          setEducation(education.map(edu => 
            edu._id === editingItem._id ? response.data.data : edu
          ));
        } else {
          // Add new education to state
          setEducation([...education, response.data.data]);
        }
        setSuccessMessage(editingItem ? 'Education updated successfully' : 'Education created successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error saving education: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      const response = await deleteStudentSkill(skillId);
      if (response.data.success) {
        setSkills(skills.filter(skill => skill._id !== skillId));
        setSuccessMessage('Skill deleted successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error deleting skill: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const response = await deleteStudentProject(projectId);
      if (response.data.success) {
        setProjects(projects.filter(project => project._id !== projectId));
        setSuccessMessage('Project deleted successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error deleting project: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteExperience = async (experienceId) => {
    try {
      const response = await deleteStudentExperience(experienceId);
      if (response.data.success) {
        setExperience(experience.filter(exp => exp._id !== experienceId));
        setSuccessMessage('Experience deleted successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error deleting experience: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteEducation = async (educationId) => {
    try {
      const response = await deleteStudentEducation(educationId);
      if (response.data.success) {
        setEducation(education.filter(edu => edu._id !== educationId));
        setSuccessMessage('Education deleted successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error deleting education: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    try {
      const response = await deleteStudentAchievement(achievementId);
      if (response.data.success) {
        setAchievements(achievements.filter(ach => ach._id !== achievementId));
        setSuccessMessage('Achievement deleted successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error deleting achievement: ' + (error.response?.data?.message || error.message));
    }
  };

  // Function to render the appropriate form fields in the edit modal
  const renderEditModalContent = () => {
    
    switch (editingSection) {
      case 'profile':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Edit Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={studentData?.fullName || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-fullName"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={studentData?.email || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-email"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">About</label>
                <textarea
                  defaultValue={studentData?.about || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  id="edit-about"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone 1</label>
                <input
                  type="text"
                  defaultValue={studentData?.phone1 || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-phone1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone 2</label>
                <input
                  type="text"
                  defaultValue={studentData?.phone2 || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-phone2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  defaultValue={studentData?.location || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  defaultValue={studentData?.dob ? new Date(studentData.dob).toISOString().split('T')[0] : ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-dob"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Template ID</label>
                <input
                  type="text"
                  defaultValue={studentData?.templateId || 'template1'}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-templateId"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Facebook</label>
                <input
                  type="text"
                  defaultValue={studentData?.socialMedia?.facebook || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-facebook"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Instagram</label>
                <input
                  type="text"
                  defaultValue={studentData?.socialMedia?.instagram || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-instagram"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Twitter</label>
                <input
                  type="text"
                  defaultValue={studentData?.socialMedia?.twitter || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-twitter"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">LinkedIn</label>
                <input
                  type="text"
                  defaultValue={studentData?.socialMedia?.linkedin || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-linkedin"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">YouTube</label>
                <input
                  type="text"
                  defaultValue={studentData?.socialMedia?.youtube || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-youtube"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">GitHub</label>
                <input
                  type="text"
                  defaultValue={studentData?.socialMedia?.github || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-github"
                />
              </div>
            </div>
          </div>
        );
      
      case 'skill':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">
              {editingItem ? 'Edit Skill' : 'Add Skill'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Skill Name</label>
                <input
                  type="text"
                  defaultValue={editingItem?.name || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-skill-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Level</label>
                <input
                  type="text"
                  defaultValue={editingItem?.level || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-skill-level"
                />
              </div>
            </div>
          </div>
        );
      
      case 'project':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">
              {editingItem ? 'Edit Project' : 'Add Project'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  defaultValue={editingItem?.title || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-project-title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  defaultValue={editingItem?.desc || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  id="edit-project-description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Technologies</label>
                <input
                  type="text"
                  defaultValue={editingItem?.tech || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-project-tech"
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Link</label>
                <input
                  type="url"
                  defaultValue={editingItem?.link || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-project-link"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-project-image"
                />
                {editingItem?.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-1">Current Image:</p>
                    <img 
                      src={editingItem.imageUrl} 
                      alt="Project" 
                      className="w-24 h-24 object-cover rounded"
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x96?text=Project'; }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'experience':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">
              {editingItem ? 'Edit Experience' : 'Add Experience'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                <input
                  type="text"
                  defaultValue={editingItem?.role || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-experience-position"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                <input
                  type="text"
                  defaultValue={editingItem?.company || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-experience-company"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
                <input
                  type="text"
                  defaultValue={editingItem?.duration || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-experience-duration"
                  placeholder="e.g., Jan 2022 - Present"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    defaultValue={editingItem?.startDate ? new Date(editingItem.startDate).toISOString().split('T')[0] : ''}
                    className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    id="edit-experience-startDate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    defaultValue={editingItem?.endDate ? new Date(editingItem.endDate).toISOString().split('T')[0] : ''}
                    className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    id="edit-experience-endDate"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  defaultValue={editingItem?.desc || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  id="edit-experience-description"
                />
              </div>
            </div>
          </div>
        );
      
      case 'education':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">
              {editingItem ? 'Edit Education' : 'Add Education'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Degree</label>
                <input
                  type="text"
                  defaultValue={editingItem?.degree || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-education-degree"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Institution</label>
                <input
                  type="text"
                  defaultValue={editingItem?.institution || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-education-institution"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    defaultValue={editingItem?.startDate ? new Date(editingItem.startDate).toISOString().split('T')[0] : ''}
                    className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    id="edit-education-startDate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    defaultValue={editingItem?.endDate ? new Date(editingItem.endDate).toISOString().split('T')[0] : ''}
                    className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    id="edit-education-endDate"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  defaultValue={editingItem?.desc || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  id="edit-education-description"
                />
              </div>
            </div>
          </div>
        );
      
      case 'achievement':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">
              {editingItem ? 'Edit Achievement' : 'Add Achievement'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  defaultValue={editingItem?.title || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-achievement-title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  defaultValue={editingItem?.date ? new Date(editingItem.date).toISOString().split('T')[0] : ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-achievement-date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  defaultValue={editingItem?.desc || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  id="edit-achievement-description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Certificate Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-achievement-image"
                />
                {editingItem?.certificateUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-1">Current Certificate:</p>
                    <img 
                      src={editingItem.certificateUrl} 
                      alt="Certificate" 
                      className="w-24 h-24 object-cover rounded"
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x96?text=Certificate'; }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className="text-white">Unknown section</div>;
    }
  };

  // Function to handle saving changes from the edit modal
  const handleSaveChanges = async () => {
    // Get form data based on the editing section
    switch (editingSection) {
      case 'profile':
        const profileData = {
          fullName: document.getElementById('edit-fullName').value,
          email: document.getElementById('edit-email').value,
          about: document.getElementById('edit-about').value,
          phone1: document.getElementById('edit-phone1').value,
          phone2: document.getElementById('edit-phone2').value,
          location: document.getElementById('edit-location').value,
          dob: document.getElementById('edit-dob').value,
          templateId: document.getElementById('edit-templateId').value,
          socialMedia: {
            facebook: document.getElementById('edit-facebook').value,
            instagram: document.getElementById('edit-instagram').value,
            twitter: document.getElementById('edit-twitter').value,
            linkedin: document.getElementById('edit-linkedin').value,
            youtube: document.getElementById('edit-youtube').value,
            github: document.getElementById('edit-github').value
          }
        };
        await handleSaveProfile(profileData);
        break;
      
      case 'skill':
        const skillData = {
          name: document.getElementById('edit-skill-name').value,
          level: document.getElementById('edit-skill-level').value
        };
        
        // Use the user ID from the student data
        const skillUserId = studentData?.userId?._id || studentData?.userId || id;
        
        // Include userId in the skill data
        const skillDataWithUserId = {
          ...skillData,
          userId: skillUserId
        };
        
        if (editingItem) {
          await handleSaveSkill(skillDataWithUserId);
        } else {
          await handleSaveSkill(skillDataWithUserId);
        }
        break;
      
      case 'project':
        const projectImageInput = document.getElementById('edit-project-image');
        const projectData = {
          title: document.getElementById('edit-project-title').value,
          desc: document.getElementById('edit-project-description').value,
          tech: document.getElementById('edit-project-tech').value,
          link: document.getElementById('edit-project-link').value
        };
        
        // Use the user ID from the student data
        const projectUserId = studentData?.userId?._id || studentData?.userId || id;
        
        // If there's an image file, create FormData
        if (projectImageInput?.files[0]) {
          const formData = new FormData();
          formData.append('projectImage', projectImageInput.files[0]);
          
          // Append other project fields with correct backend names
          Object.keys(projectData).forEach(key => {
            if (projectData[key] !== undefined && projectData[key] !== null) {
              // Map frontend field names to backend field names
              let backendKey = key;
              if (key === 'title') backendKey = 'projectName';
              else if (key === 'desc') backendKey = 'description';
              else if (key === 'tech') backendKey = 'technologies';
              else if (key === 'link') backendKey = 'projectUrl';
              
              formData.append(backendKey, projectData[key]);
            }
          });
          
          // Add userId to FormData
          formData.append('userId', projectUserId);
          
          if (editingItem) {
            await handleSaveProject(formData);
          } else {
            await handleSaveProject(formData);
          }
        } else {
          // If no image file, send as regular JSON
          // Map frontend field names to backend field names
          const mappedProjectData = {
            userId: projectUserId // Include userId in the mapped data
          };
          Object.keys(projectData).forEach(key => {
            let backendKey = key;
            if (key === 'title') backendKey = 'projectName';
            else if (key === 'desc') backendKey = 'description';
            else if (key === 'tech') backendKey = 'technologies';
            else if (key === 'link') backendKey = 'projectUrl';
            else backendKey = key;
            
            mappedProjectData[backendKey] = projectData[key];
          });
          
          if (editingItem) {
            await handleSaveProject(mappedProjectData);
          } else {
            await handleSaveProject(mappedProjectData);
          }
        }
        break;
      
      case 'experience':
        const companyElement = document.getElementById('edit-experience-company');
        const roleElement = document.getElementById('edit-experience-position');
        const durationElement = document.getElementById('edit-experience-duration');
        const startDateElement = document.getElementById('edit-experience-startDate');
        const endDateElement = document.getElementById('edit-experience-endDate');
        const descElement = document.getElementById('edit-experience-description');
   
        
        const experienceData = {
          company: companyElement?.value || '',
          role: roleElement?.value || '',
          duration: durationElement?.value || '',
          startDate: startDateElement?.value || '',
          endDate: endDateElement?.value || '',
          desc: descElement?.value || ''
        };
        
        
        // Use the user ID from the student data
        const experienceUserId = studentData?.userId?._id || studentData?.userId || id;
      
        
        // Include userId in the experience data
        const experienceDataWithUserId = {
          ...experienceData,
          userId: experienceUserId
        };
        
        
        if (editingItem) {
          await handleSaveExperience(experienceDataWithUserId);
        } else {
          await handleSaveExperience(experienceDataWithUserId);
        }
        break;      
      case 'education':
        const educationData = {
          school: document.getElementById('edit-education-institution').value,
          degree: document.getElementById('edit-education-degree').value,
          major: '', // Not in form, but required by model
          year: '', // Not in form, but required by model
          gpa: '' // Not in form, but required by model
        };
        
        // Use the user ID from the student data
        const educationUserId = studentData?.userId?._id || studentData?.userId || id;
        
        // Include userId in the education data
        const educationDataWithUserId = {
          ...educationData,
          userId: educationUserId
        };
        
        if (editingItem) {
          await handleSaveEducation(educationDataWithUserId);
        } else {
          await handleSaveEducation(educationDataWithUserId);
        }
        break;
      
      case 'achievement':
        const achievementImageInput = document.getElementById('edit-achievement-image');
        const achievementData = {
          title: document.getElementById('edit-achievement-title').value,
          date: document.getElementById('edit-achievement-date').value,
          desc: document.getElementById('edit-achievement-description').value
        };
        
        // Use the user ID from the student data
        const achievementUserId = studentData?.userId?._id || studentData?.userId || id;
        
        // If there's an image file, create FormData
        if (achievementImageInput?.files[0]) {
          const formData = new FormData();
          formData.append('certificateImage', achievementImageInput.files[0]);
          
          // Append other achievement fields with correct backend names
          Object.keys(achievementData).forEach(key => {
            if (achievementData[key] !== undefined && achievementData[key] !== null) {
              // Map frontend field names to backend field names
              let backendKey = key;
              if (key === 'title') backendKey = 'title'; // Same name
              else if (key === 'desc') backendKey = 'description';
              else if (key === 'date') backendKey = 'date'; // Same name
              else backendKey = key;
              
              formData.append(backendKey, achievementData[key]);
            }
          });
          
          // Add userId to FormData
          formData.append('userId', achievementUserId);
          
          if (editingItem) {
            await handleSaveAchievement(formData);
          } else {
            await handleSaveAchievement(formData);
          }
        } else {
          // If no image file, send as regular JSON
          // Map frontend field names to backend field names
          const mappedAchievementData = {
            userId: achievementUserId // Include userId in the mapped data
          };
          Object.keys(achievementData).forEach(key => {
            let backendKey = key;
            if (key === 'title') backendKey = 'title'; // Same name
            else if (key === 'desc') backendKey = 'description';
            else if (key === 'date') backendKey = 'date'; // Same name
            else backendKey = key;
            
            mappedAchievementData[backendKey] = achievementData[key];
          });
          
          if (editingItem) {
            await handleSaveAchievement(mappedAchievementData);
          } else {
            await handleSaveAchievement(mappedAchievementData);
          }
        }
        break;
      
      default:
        throw new Error('Unknown section');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6 mt-20">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-green-500 hover:text-green-400 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Student Details</h1>
        </div>
        <div className="bg-red-500 text-white p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6 mt-20">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-green-500 hover:text-green-400 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Student Details</h1>
        </div>
        <div className="bg-yellow-500 text-white p-3 rounded-md">
          Student data not found
        </div>
      </div>
    );
  }

  // Format social media links
  const formatSocialLink = (link) => {
    if (!link) return '';
    if (link.startsWith('http')) return link;
    return `https://${link}`;
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6 mt-20">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 bg-green-500 text-white p-3 rounded-md">
          {successMessage}
        </div>
      )}
      
      {error && !editModalOpen && (
        <div className="mb-4 bg-red-500 text-white p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Back Button and Title */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-green-500 hover:text-green-400 mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-white">Student Details</h1>
      </div>

      {/* Profile Section */}
      <div className="bg-[#0f0f1a] rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-green-500" />
            Profile Information
          </h2>
          <button 
            onClick={() => openEditModal('profile')}
            className="flex items-center text-green-500 hover:text-green-400"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Full Name</p>
            <p className="text-white">{studentData.fullName || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-white">{studentData.email || studentData.userId?.email || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">About</p>
            <p className="text-white">{studentData.about || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Phone 1</p>
            <p className="text-white">{studentData.phone1 || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Phone 2</p>
            <p className="text-white">{studentData.phone2 || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Location</p>
            <p className="text-white">{studentData.location || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Date of Birth</p>
            <p className="text-white">
              {studentData.dob ? new Date(studentData.dob).toLocaleDateString() : 'Not provided'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">Template ID</p>
            <p className="text-white">{studentData.templateId || 'template1'}</p>
          </div>
        </div>
        
        {/* Social Media Links */}
        <div className="mt-4">
          <p className="text-gray-400 text-sm mb-2">Social Media</p>
          <div className="flex flex-wrap gap-2">
            {studentData.socialMedia?.facebook && (
              <a 
                href={formatSocialLink(studentData.socialMedia.facebook)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
              >
                <Facebook className="h-4 w-4 mr-1" />
                Facebook
              </a>
            )}
            
            {studentData.socialMedia?.instagram && (
              <a 
                href={formatSocialLink(studentData.socialMedia.instagram)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center bg-pink-600 text-white px-3 py-1 rounded-full text-sm"
              >
                <Instagram className="h-4 w-4 mr-1" />
                Instagram
              </a>
            )}
            
            {studentData.socialMedia?.twitter && (
              <a 
                href={formatSocialLink(studentData.socialMedia.twitter)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center bg-blue-400 text-white px-3 py-1 rounded-full text-sm"
              >
                <Twitter className="h-4 w-4 mr-1" />
                Twitter
              </a>
            )}
            
            {studentData.socialMedia?.linkedin && (
              <a 
                href={formatSocialLink(studentData.socialMedia.linkedin)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center bg-blue-700 text-white px-3 py-1 rounded-full text-sm"
              >
                <Linkedin className="h-4 w-4 mr-1" />
                LinkedIn
              </a>
            )}
            
            {studentData.socialMedia?.youtube && (
              <a 
                href={formatSocialLink(studentData.socialMedia.youtube)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center bg-red-600 text-white px-3 py-1 rounded-full text-sm"
              >
                <Youtube className="h-4 w-4 mr-1" />
                YouTube
              </a>
            )}
            
            {studentData.socialMedia?.github && (
              <a 
                href={formatSocialLink(studentData.socialMedia.github)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-full text-sm"
              >
                <span className="mr-1">GH</span>
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-[#0f0f1a] rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-500" />
            Skills
          </h2>
          <button 
            onClick={() => openEditModal('skill')}
            className="flex items-center text-green-500 hover:text-green-400"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Skill
          </button>
        </div>
        
        {skills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div key={skill._id} className="bg-[#1a1a2e] rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-medium">{skill.name}</h3>
                  <p className="text-gray-400 text-sm">Level: {skill.level || 'Not specified'}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => openEditModal('skill', skill)}
                    className="text-green-500 hover:text-green-400"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteSkill(skill._id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No skills added yet</p>
        )}
      </div>

      {/* Projects Section */}
      <div className="bg-[#0f0f1a] rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-green-500" />
            Projects
          </h2>
          <button 
            onClick={() => openEditModal('project')}
            className="flex items-center text-green-500 hover:text-green-400"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Project
          </button>
        </div>
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <div key={project._id} className="bg-[#1a1a2e] rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {project.imageUrl && (
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x200?text=Project+Image'; }}
                      />
                    )}
                    <h3 className="text-white font-medium">{project.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{project.desc}</p>
                    {project.tech && (
                      <p className="text-gray-400 text-xs mt-1">
                        <span className="font-medium">Technologies:</span> {project.tech}
                      </p>
                    )}
                    {project.link && (
                      <a 
                        href={formatSocialLink(project.link)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-500 hover:text-green-400 text-sm mt-2 inline-block"
                      >
                        View Project
                      </a>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openEditModal('project', project)}
                      className="text-green-500 hover:text-green-400"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(project._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No projects added yet</p>
        )}
      </div>

      {/* Experience Section */}
      <div className="bg-[#0f0f1a] rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-green-500" />
            Work Experience
          </h2>
          <button 
            onClick={() => openEditModal('experience')}
            className="flex items-center text-green-500 hover:text-green-400"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </button>
        </div>
        
        {experience.length > 0 ? (
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp._id} className="bg-[#1a1a2e] rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-medium">{exp.role}</h3>
                    <p className="text-gray-400">{exp.company}</p>
                    {exp.duration && (
                      <p className="text-gray-400 text-sm">{exp.duration}</p>
                    )}
                    <p className="text-gray-400 text-sm">
                      {exp.startDate && new Date(exp.startDate).getFullYear()} - 
                      {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">{exp.desc}</p>
                  </div>                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openEditModal('experience', exp)}
                      className="text-green-500 hover:text-green-400"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteExperience(exp._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No work experience added yet</p>
        )}
      </div>

      {/* Education Section */}
      <div className="bg-[#0f0f1a] rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <School className="h-5 w-5 mr-2 text-green-500" />
            Education
          </h2>
          <button 
            onClick={() => openEditModal('education')}
            className="flex items-center text-green-500 hover:text-green-400"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Education
          </button>
        </div>
        
        {education.length > 0 ? (
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu._id} className="bg-[#1a1a2e] rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-medium">{edu.degree}{edu.major ? `, ${edu.major}` : ''}</h3>
                    <p className="text-gray-400">{edu.school}</p>
                    <p className="text-gray-400 text-sm">
                      {edu.year || (edu.startDate && new Date(edu.startDate).getFullYear())} - 
                      {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                    </p>
                    {edu.gpa && (
                      <p className="text-gray-400 text-sm mt-1">GPA: {edu.gpa}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openEditModal('education', edu)}
                      className="text-green-500 hover:text-green-400"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteEducation(edu._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No education added yet</p>
        )}
      </div>

      {/* Achievements Section */}
      <div className="bg-[#0f0f1a] rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Award className="h-5 w-5 mr-2 text-green-500" />
            Achievements
          </h2>
          <button 
            onClick={() => openEditModal('achievement')}
            className="flex items-center text-green-500 hover:text-green-400"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Achievement
          </button>
        </div>
        
        {achievements.length > 0 ? (
          <div className="space-y-4">
            {achievements.map((ach) => (
              <div key={ach._id} className="bg-[#1a1a2e] rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {ach.certificateUrl ? (
                        <img 
                          src={ach.certificateUrl} 
                          alt={`${ach.title} Certificate`}
                          className="w-16 h-16 object-cover rounded flex-shrink-0 mt-1"
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/64x64?text=Certificate'; }}
                        />
                      ) : (
                        <Award className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                      )}
                      <div>
                        <h3 className="text-white font-medium">{ach.title}</h3>
                        <p className="text-gray-400 text-sm">
                          {ach.date && new Date(ach.date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">{ach.desc}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openEditModal('achievement', ach)}
                      className="text-green-500 hover:text-green-400"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAchievement(ach._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No achievements added yet</p>
        )}
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        title={`Edit ${editingSection.charAt(0).toUpperCase() + editingSection.slice(1)}`}
        onSave={handleSaveChanges}
      >
        <form id="edit-form">
          {renderEditModalContent()}
        </form>
      </EditModal>
    </div>
  );
};

export default ViewStudentDetails;