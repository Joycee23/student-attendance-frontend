import React, { useState, useEffect } from "react";
import { usersAPI, classesAPI } from "../services/api";
import "../styles/ClassManagement.css";

const ClassManagement = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Assign Students, 1: Assign Teachers
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Student assignment states
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState("");

  // Teacher assignment states
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClassForTeacher, setSelectedClassForTeacher] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch students
      const studentsResponse = await usersAPI.getAll({ role: "student" });
      const studentsData = studentsResponse.data?.data?.users ||
                          studentsResponse.data?.users ||
                          studentsResponse.data?.data ||
                          studentsResponse.data || [];
      setStudents(Array.isArray(studentsData) ? studentsData : []);

      // Fetch teachers
      const teachersResponse = await usersAPI.getAll({ role: "lecturer" });
      const teachersData = teachersResponse.data?.data?.users ||
                          teachersResponse.data?.users ||
                          teachersResponse.data?.data ||
                          teachersResponse.data || [];
      setTeachers(Array.isArray(teachersData) ? teachersData : []);

      // Fetch classes
      const classesResponse = await classesAPI.getAll({});
      const classesData = classesResponse.data?.data?.classes ||
                         classesResponse.data?.classes ||
                         classesResponse.data?.data ||
                         classesResponse.data || [];
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignStudents = async () => {
    if (!selectedClassForStudents || selectedStudents.length === 0) {
      alert("Please select a class and at least one student");
      return;
    }

    try {
      setLoading(true);
      console.log("Assigning students:", {
        classId: selectedClassForStudents,
        studentIds: selectedStudents
      });

      // Try different payload formats
      const payload = { studentIds: selectedStudents };
      console.log("Payload:", payload);

      await classesAPI.addStudents(selectedClassForStudents, selectedStudents);
      alert(`Successfully assigned ${selectedStudents.length} student(s) to the class`);

      // Reset selections
      setSelectedStudents([]);
      setSelectedClassForStudents("");

      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error("Error assigning students:", error);
      const errorMessage = error.response?.data?.message || "Failed to assign students to class";
      const errors = error.response?.data?.errors || [];
      let fullMessage = errorMessage;
      if (errors.length > 0) {
        fullMessage += "\nDetails: " + errors.map((e: any) => e.message).join(", ");
      }
      alert(`Failed to assign students to class: ${fullMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedClassForTeacher || !selectedTeacher) {
      alert("Please select a class and a teacher");
      return;
    }

    try {
      setLoading(true);
      // Note: This assumes the API has an endpoint to assign teacher to class
      // You may need to adjust based on your actual API
      await classesAPI.update(selectedClassForTeacher, { lecturer: selectedTeacher });
      alert("Successfully assigned teacher to class");

      // Reset selections
      setSelectedTeacher("");
      setSelectedClassForTeacher("");

      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error("Error assigning teacher:", error);
      const errorMessage = error.response?.data?.message || "Failed to assign teacher to class";
      alert(`Failed to assign teacher to class: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getClassStudents = (classId: string) => {
    const cls = classes.find(c => c._id === classId || c.id === classId);
    return cls?.studentIds?.length || cls?.students?.length || 0;
  };

  if (loading && classes.length === 0) {
    return <div className="loading">Loading class management data...</div>;
  }

  return (
    <div className="class-management">
      <div className="content-section">
        <div className="content-card">
          <h2 className="section-title">Class Management</h2>
          <p className="section-subtitle">Assign students and teachers to classes</p>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              Assign Students to Classes
            </button>
            <button
              className={`tab-button ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              Assign Teachers to Classes
            </button>
          </div>

          {/* Assign Students Tab */}
          {activeTab === 0 && (
            <div className="assignment-section">
              <h3>Assign Students to Class</h3>

              {/* Class Selection */}
              <div className="form-group">
                <label className="form-label">Select Class</label>
                <select
                  value={selectedClassForStudents}
                  onChange={(e) => setSelectedClassForStudents(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose a class...</option>
                  {classes.map((cls) => (
                    <option key={cls._id || cls.id} value={cls._id || cls.id}>
                      {cls.name || 'Unnamed Class'} ({cls.code || cls.courseCode}) - {getClassStudents(cls._id || cls.id)} students
                    </option>
                  ))}
                </select>
              </div>

              {/* Students Selection */}
              <div className="form-group">
                <label className="form-label">Select Students to Assign</label>
                <div className="students-list">
                  {students.map((student) => (
                    <div key={student._id || student.id} className="student-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id || student.id)}
                          onChange={() => handleStudentSelection(student._id || student.id)}
                        />
                        <span className="student-info">
                          {student.fullName} ({student.email})
                          {student.studentCode && ` - ${student.studentCode}`}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
                {selectedStudents.length > 0 && (
                  <p className="selection-count">{selectedStudents.length} student(s) selected</p>
                )}
              </div>

              <button
                onClick={handleAssignStudents}
                disabled={loading || !selectedClassForStudents || selectedStudents.length === 0}
                className="btn-primary"
              >
                {loading ? "Assigning..." : `Assign ${selectedStudents.length} Student(s)`}
              </button>
            </div>
          )}

          {/* Assign Teachers Tab */}
          {activeTab === 1 && (
            <div className="assignment-section">
              <h3>Assign Teacher to Class</h3>

              {/* Class Selection */}
              <div className="form-group">
                <label className="form-label">Select Class</label>
                <select
                  value={selectedClassForTeacher}
                  onChange={(e) => setSelectedClassForTeacher(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose a class...</option>
                  {classes.map((cls) => (
                    <option key={cls._id || cls.id} value={cls._id || cls.id}>
                      {cls.name || 'Unnamed Class'} ({cls.code || cls.courseCode})
                      {cls.lecturerName && ` - ${cls.lecturerName}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Selection */}
              <div className="form-group">
                <label className="form-label">Select Teacher</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                      {teacher.fullName} ({teacher.email})
                      {teacher.lecturerCode && ` - ${teacher.lecturerCode}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAssignTeacher}
                disabled={loading || !selectedClassForTeacher || !selectedTeacher}
                className="btn-primary"
              >
                {loading ? "Assigning..." : "Assign Teacher"}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ClassManagement;