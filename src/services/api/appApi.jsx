import http from '@/services/http';

export const UsersApi = {
  list(params) { // { page, limit, ... }
    return http.get('/users', { params }).then(r => r.data);
  },
  get(id) {
    return http.get(`/users/${id}`).then(r => r.data);
  },
  // thêm create/update/delete nếu backend hỗ trợ
};

export const QuizzesApi = {
  list(params) { return http.get('/quizzes', { params }).then(r => r.data); },
  get(id)      { return http.get(`/quizzes/${id}`).then(r => r.data); },
  create(body) { return http.post('/quizzes', body).then(r => r.data); },
  update(id, body) { return http.patch(`/quizzes/${id}`, body).then(r => r.data); },
  delete(id)   { return http.delete(`/quizzes/${id}`).then(r => r.data); },
};

export const CoursesApi = {
  list(params) {
    // ví dụ: { limit: 5, page: 10 } -> /courses?limit=5&page=10
    return http.get('/courses', { params }).then(r => r.data);
  },
  get(id)      { return http.get(`/courses/${id}`).then(r => r.data); },
  create(body) { return http.post('/courses', body).then(r => r.data); },
  update(id, body) { return http.patch(`/courses/${id}`, body).then(r => r.data); },
  delete(id)   { return http.delete(`/courses/${id}`).then(r => r.data); },
};

export const SessionsApi = {
  list(params)  { return http.get('/sessions', { params }).then(r => r.data); },
  get(id)       { return http.get(`/sessions/${id}`).then(r => r.data); },
  create(body)  { return http.post('/sessions', body).then(r => r.data); }, 
  update(id, body) { return http.patch(`/sessions/${id}`, body).then(r => r.data); },
  delete(id)    { return http.delete(`/sessions/${id}`).then(r => r.data); },
};

export const LessonsApi = {
  list(params)  { return http.get('/lessons', { params }).then(r => r.data); },
  get(id)       { return http.get(`/lessons/${id}`).then(r => r.data); },
  create(body)  { return http.post('/lessons', body).then(r => r.data); }, 
  update(id, body) { return http.patch(`/lessons/${id}`, body).then(r => r.data); },
  delete(id)    { return http.delete(`/lessons/${id}`).then(r => r.data); },
};
