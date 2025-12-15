import http from "@/services/http";

export const ClassApi = {
  getAll: async () => {
    const res = await http.get("/classes");
    return res.data;
  },
  
  getById: async (id) => {
    const res = await http.get(`/classes/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await http.post("/classes", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await http.patch(`/classes/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await http.delete(`/classes/${id}`);
    return res.data;
  },

  getStudents: async (classId) => {
    const res = await http.get(`/classes/${classId}/students`);
    return res.data;
  },

  addStudent: async (classId, studentId) => {
    const res = await http.post(`/classes/${classId}/students`, { studentId });
    return res.data;
  },

  removeStudent: async (classId, studentId) => {
    const res = await http.delete(`/classes/${classId}/students/${studentId}`);
    return res.data;
  },

  getSubmissionsByLessonItem: async (lessonItemId) => {
    // Lấy bài nộp Essay
    const res = await http.get(`/admin/submissions`, { 
      params: { lessonItemId, limit: 100 } 
    });
    return res.data; 
  },

  getMyEnrollments: async () => {
    const res = await http.get("/classes/my-enrollments");
    return res.data;
  },
  
  getQuizResults: async (quizId, lessonItemId) => {
    // Gửi request: GET /quizzes/:id/results?lessonItemId=...
    const res = await http.get(`/quizzes/${quizId}/results`, {
       params: { lessonItemId } // 👈 Thêm dòng này
    });
    return res.data; 
  },

  // 👇 QUAN TRỌNG: Hàm này giúp ClassCurriculum hiển thị danh sách bài học
  getCourseStructure: async (courseId) => {
    const res = await http.get(`/courses/${courseId}/full-structure`); 
    return res.data;
  },

  gradeSubmission: async (id, data) => {
    // data gồm: { status, score, feedback }
    const res = await http.patch(`/admin/submissions/${id}/grade`, data);
    return res.data;
  }
};