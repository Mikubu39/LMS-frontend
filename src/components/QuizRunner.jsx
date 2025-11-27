import { useState, useEffect, useRef } from "react";
import { Modal, Button, Typography, message, Result, Spin, Space } from "antd";
import { CheckCircleFilled, ClockCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { QuizApi } from "@/services/api/quizApi";

const { Title, Text } = Typography;

export default function QuizRunner({ 
  isOpen, 
  onClose, 
  quizId, 
  lessonItemId, 
  onComplete 
}) {
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  
  // State quản lý câu hỏi hiện tại
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Lưu đáp án: { question_id: "a" }
  const [userAnswers, setUserAnswers] = useState({}); 
  
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const timerRef = useRef(null);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    if (isOpen && quizId) {
      setLoading(true);
      setResult(null);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      
      QuizApi.getById(quizId)
        .then((data) => {
          setQuizData(data);
          setTimeLeft((data.duration || 15) * 60); 
        })
        .catch(() => {
          message.error("Không thể tải đề thi");
          onClose();
        })
        .finally(() => setLoading(false));
    }
    return () => clearInterval(timerRef.current);
  }, [isOpen, quizId]);

  // --- 2. TIMER ---
  useEffect(() => {
    if (timeLeft > 0 && !result && !loading) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, result, loading]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- 3. HANDLERS ---
  const handleSelectOption = (questionId, optionKey) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quizData?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Nếu là câu cuối cùng thì Nộp bài
      Modal.confirm({
        title: "Nộp bài?",
        content: "Bạn đã hoàn thành tất cả câu hỏi. Bạn có muốn nộp bài ngay không?",
        okText: "Nộp bài",
        cancelText: "Kiểm tra lại",
        onOk: handleSubmit
      });
    }
  };

  const handleSubmit = async () => {
    if (!quizData) return;
    clearInterval(timerRef.current);
    setIsSubmitting(true);

    const payload = {
      answers: Object.keys(userAnswers).map((qId) => ({
        question_id: qId,
        selected_answer: userAnswers[qId],
      })),
      lessonItemId: lessonItemId, 
    };

    try {
      const res = await QuizApi.submitQuiz(quizId, payload);
      setResult(res);
      if (onComplete) onComplete();
    } catch (error) {
      message.error("Nộp bài thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lấy câu hỏi hiện tại
  const currentQuestion = quizData?.questions?.[currentQuestionIndex];
  const totalQuestions = quizData?.questions?.length || 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // --- RENDER OPTIONS (A, B, C, D) ---
  const renderOption = (optionKey, optionText) => {
    const isSelected = userAnswers[currentQuestion?.question_id] === optionKey;
    
    return (
      <div
        onClick={() => handleSelectOption(currentQuestion.question_id, optionKey)}
        style={{
          padding: '16px 20px',
          marginBottom: 12,
          borderRadius: 8,
          border: isSelected ? '1px solid #4caf50' : '1px solid #e0e0e0',
          background: isSelected ? '#4caf50' : '#fff',
          color: isSelected ? '#fff' : '#333',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          fontWeight: isSelected ? 500 : 400,
          boxShadow: isSelected ? '0 2px 8px rgba(76, 175, 80, 0.3)' : 'none'
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: '50%', border: '2px solid',
          borderColor: isSelected ? '#fff' : '#ccc',
          marginRight: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {isSelected && <div style={{width: 10, height: 10, background: '#fff', borderRadius: '50%'}} />}
        </div>
        <span style={{fontSize: 15}}>{optionText}</span>
      </div>
    );
  };

  return (
    <Modal
      open={isOpen}
      onCancel={() => {
        if (!result) {
            Modal.confirm({
                title: "Thoát bài thi?",
                content: "Kết quả sẽ không được lưu. Bạn chắc chắn muốn thoát?",
                onOk: onClose
            });
        } else {
            onClose();
        }
      }}
      footer={null}
      width={900}
      maskClosable={false}
      destroyOnClose
      centered
      // Ẩn header mặc định của Modal để tự custom cho giống ảnh
      styles={{ body: { padding: 0 }, content: { borderRadius: 12, overflow: 'hidden' } }}
      closable={false}
    >
      {loading ? (
        <div style={{ padding: 60, textAlign: "center" }}><Spin size="large" tip="Đang tải đề..." /></div>
      ) : !result ? (
        <div style={{ display: 'flex', minHeight: 600, background: '#f5f7fa' }}>
          
          {/* --- CỘT TRÁI: NỘI DUNG CÂU HỎI --- */}
          <div style={{ flex: 1, padding: '30px 40px', background: '#fff' }}>
            {/* Header: Thời gian & Số câu */}
            <div style={{ marginBottom: 20 }}>
               <Text type="secondary" style={{fontSize: 14}}>
                 Thời gian còn lại: <span style={{color: '#d32f2f', fontWeight: 600, fontSize: 16}}>{formatTime(timeLeft)}</span>
               </Text>
               <div style={{marginTop: 4, color: '#666'}}>
                 Câu số {currentQuestionIndex + 1}
               </div>
            </div>

            {/* Nội dung câu hỏi */}
            {currentQuestion && (
              <div>
                <Title level={4} style={{ marginBottom: 30, fontSize: 20, lineHeight: 1.4 }}>
                  {currentQuestion.question_text}
                </Title>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {renderOption('a', currentQuestion.option_a)}
                  {renderOption('b', currentQuestion.option_b)}
                  {renderOption('c', currentQuestion.option_c)}
                  {renderOption('d', currentQuestion.option_d)}
                </div>
              </div>
            )}

            {/* Nút điều hướng */}
            <div style={{ marginTop: 40, textAlign: 'right', borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
               <Button 
                 type="default" 
                 size="large" 
                 style={{ 
                   background: '#fff3e0', 
                   borderColor: '#ffe0b2', 
                   color: '#e65100',
                   fontWeight: 600,
                   borderRadius: 8,
                   height: 45,
                   padding: '0 30px'
                 }}
                 onClick={handleNext}
               >
                 {isLastQuestion ? "Nộp bài" : "Câu tiếp theo"} <ArrowRightOutlined />
               </Button>
            </div>
          </div>

          {/* --- CỘT PHẢI: DANH SÁCH CÂU HỎI (SIDEBAR) --- */}
          <div style={{ width: 300, background: '#fff', borderLeft: '1px solid #eee', padding: 20, display: 'flex', flexDirection: 'column' }}>
             <Title level={5} style={{ marginBottom: 20 }}>Danh sách câu hỏi</Title>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, alignContent: 'start', flex: 1 }}>
                {quizData?.questions?.map((q, idx) => {
                   const isAnswered = !!userAnswers[q.question_id];
                   const isCurrent = idx === currentQuestionIndex;
                   
                   return (
                     <div 
                        key={q.question_id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        style={{
                           width: 40, height: 40, 
                           borderRadius: 8,
                           display: 'flex', alignItems: 'center', justifyContent: 'center',
                           cursor: 'pointer',
                           fontWeight: 600,
                           fontSize: 14,
                           // Logic màu sắc giống ảnh
                           background: isCurrent ? '#e6f7ff' : (isAnswered ? '#e8f5e9' : '#f5f5f5'),
                           color: isCurrent ? '#1890ff' : (isAnswered ? '#2e7d32' : '#666'),
                           border: isCurrent ? '1px solid #1890ff' : (isAnswered ? '1px solid #a5d6a7' : '1px solid #ddd')
                        }}
                     >
                        {idx + 1}
                     </div>
                   )
                })}
             </div>

             <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #eee' }}>
                <Button 
                  type="primary" 
                  block 
                  size="large" 
                  loading={isSubmitting}
                  onClick={() => {
                    Modal.confirm({
                      title: "Nộp bài ngay?",
                      content: "Bạn có chắc chắn muốn nộp bài không?",
                      onOk: handleSubmit
                    });
                  }}
                  style={{borderRadius: 8, height: 45}}
                >
                  Nộp bài thi
                </Button>
                <Button 
                  block 
                  size="large" 
                  style={{ marginTop: 10, borderRadius: 8, height: 45 }}
                  onClick={() => {
                    Modal.confirm({
                        title: "Thoát?", 
                        content: "Kết quả sẽ bị hủy.",
                        onOk: onClose
                    })
                  }}
                >
                  Thoát
                </Button>
             </div>
          </div>

        </div>
      ) : (
        // --- GIAO DIỆN KẾT QUẢ ---
        <div style={{padding: 50, textAlign: 'center'}}>
           <Result
            status={result.score >= 50 ? "success" : "warning"}
            icon={result.score >= 50 ? <CheckCircleFilled style={{color: '#52c41a', fontSize: 72}} /> : undefined}
            title={
                <div style={{fontSize: 28, fontWeight: 700, marginBottom: 10}}>
                    {result.score >= 50 ? "Chúc mừng! Bạn đã hoàn thành." : "Rất tiếc, bạn chưa đạt."}
                </div>
            }
            subTitle={
              <div style={{ fontSize: 18, background: '#f9f9f9', padding: 20, borderRadius: 12, display: 'inline-block', marginTop: 10 }}>
                <div style={{marginBottom: 8}}>Điểm số của bạn</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: result.score >= 50 ? '#52c41a' : '#faad14', lineHeight: 1 }}>
                    {result.score}
                </div>
                <div style={{color: '#888', marginTop: 5}}>trên thang điểm 100</div>
                
                <div style={{marginTop: 20, paddingTop: 15, borderTop: '1px solid #eee', display: 'flex', gap: 20, justifyContent: 'center'}}>
                    <div>
                        <div style={{fontSize: 12, color: '#999'}}>Số câu đúng</div>
                        <div style={{fontSize: 20, fontWeight: 600}}>{result.correctAnswers}/{result.totalQuestions}</div>
                    </div>
                    <div>
                        <div style={{fontSize: 12, color: '#999'}}>Thời gian</div>
                        <div style={{fontSize: 20, fontWeight: 600}}>{formatTime((quizData.duration * 60) - timeLeft)}</div>
                    </div>
                </div>
              </div>
            }
            extra={[
              <Button type="primary" size="large" key="close" onClick={onClose} style={{minWidth: 150, height: 45, borderRadius: 8}}>
                Quay lại bài học
              </Button>,
            ]}
          />
        </div>
      )}
    </Modal>
  );
}