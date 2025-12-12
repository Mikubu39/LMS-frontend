// src/components/QuizRunner.jsx
import React, { useEffect, useState, useRef } from "react";
import { Radio, Button, Spin, message, Progress, Input } from "antd"; 
import { ReloadOutlined, ArrowRightOutlined, CloseOutlined } from "@ant-design/icons";
import { QuizApi } from "@/services/api/quizApi";
import "../css/quiz.css";

// 👇👇👇 SỬA PHẦN IMPORT ẢNH TẠI ĐÂY 👇👇👇
// Import từ thư mục assets (dùng đường dẫn tương đối)
import imgPass from "../assets/pass.png";
import imgFail from "../assets/khongdat.png"; 
// 👆👆👆 --------------------------------- 👆👆👆

export default function QuizRunner({ 
  isOpen,         
  onClose,       
  quizId,         
  lessonItemId,   
  onComplete      
}) {
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [viewState, setViewState] = useState("loading"); 
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // State lưu đáp án
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0); 
  const [resultData, setResultData] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    if (!quizId) return;
    fetchQuizDetail();
    return () => clearInterval(timerRef.current);
  }, [quizId]);

  useEffect(() => {
    if (viewState === "doing" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitQuiz(answers);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [viewState, timeLeft]);

  const fetchQuizDetail = async () => {
    setLoading(true);
    try {
      const data = await QuizApi.getById(quizId);
      setQuizData(data);
      startQuiz(data);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải bài kiểm tra");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (data) => {
    setAnswers({});
    setCurrentQIndex(0);
    setResultData(null);
    setTimeLeft((data.duration || 10) * 60); 
    setViewState("doing");
  };

  // --- XỬ LÝ CHỌN ĐÁP ÁN ---

  // 1. Trắc nghiệm (Radio)
  const handleSelectMultiChoice = (qId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: value
    }));
  };

  // 2. Điền từ (Input)
  const handleFillBlankChange = (qId, slotIndex, textValue) => {
    setAnswers((prev) => {
      const currentArr = Array.isArray(prev[qId]) ? [...prev[qId]] : [];
      const existingIdx = currentArr.findIndex(item => item.index === slotIndex);

      if (existingIdx > -1) {
        currentArr[existingIdx].answer = textValue;
      } else {
        currentArr.push({ index: slotIndex, answer: textValue });
      }

      return {
        ...prev,
        [qId]: currentArr
      };
    });
  };

  const handleNext = () => {
    if (currentQIndex < quizData.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async (finalAnswers = answers) => {
    clearInterval(timerRef.current);
    setLoading(true);
    
    const payload = {
      lessonItemId: lessonItemId,
      answers: Object.keys(finalAnswers).map((qId) => ({
        question_id: qId,
        selected_answer: finalAnswers[qId] 
      }))
    };

    try {
      const res = await QuizApi.submitQuiz(quizId, payload);
      setResultData(res);
      setViewState("result");
      if (onComplete && res.score >= 80) {
          onComplete();
      }
    } catch (error) {
      console.error(error);
      message.error("Nộp bài thất bại");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  };

  // Helper render input cho điền từ
  const renderFillInBlankInputs = (question) => {
    const slots = question.answers || [];
    if (slots.length === 0) return <div style={{color:'red'}}>Lỗi: Không tìm thấy vị trí điền từ</div>;

    const currentAnswerArr = answers[question.question_id] || [];

    return (
      <div className="quiz-fill-blank-container">
        {slots.map((slot, i) => {
           const userEntry = currentAnswerArr.find(a => a.index === slot.index);
           const val = userEntry ? userEntry.answer : "";

           return (
             <div key={i} style={{ marginBottom: 16 }}>
                <span style={{ fontWeight: 600, marginRight: 8 }}>Ô trống số {i + 1}:</span>
                <Input 
                  style={{ width: 300 }} 
                  placeholder="Nhập câu trả lời của bạn..." 
                  value={val}
                  onChange={(e) => handleFillBlankChange(question.question_id, slot.index, e.target.value)}
                />
             </div>
           );
        })}
      </div>
    );
  };

  // --- RENDER ---
  if (loading && !quizData) return <div className="quiz-container"><Spin style={{margin: 'auto'}}/></div>;
  if (!quizData) return null;

  if (viewState === "result" && resultData) {
    const isPass = resultData.score >= 80;
    return (
      <div className="quiz-container">
        <div className="quiz-result-view">
          
          {/* 👇 SỬ DỤNG BIẾN ĐÃ IMPORT (imgPass / imgFail) */}
          <img 
            src={isPass ? imgPass : imgFail} 
            alt="Result Mascot" 
            className="quiz-mascot-img" 
          />
          
          <div className="quiz-score-circle">
            <Progress 
                type="circle" 
                percent={resultData.score} 
                format={(p) => <span style={{fontSize: 20, fontWeight:'bold'}}>{p}/100</span>} 
                strokeColor={isPass ? "#12B76A" : "#ff4d4f"} 
                width={120} 
            />
          </div>
          <h2 className="quiz-result-title">{isPass ? "Chúc mừng!" : "Chưa đạt yêu cầu!"}</h2>
          <div className="quiz-action-row">
            <button className="quiz-btn quiz-btn-secondary" onClick={() => fetchQuizDetail()}>
                <ReloadOutlined style={{marginRight:8}}/> Làm lại
            </button>
            <Button style={{marginLeft: 10}} onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQIndex];
  
  // Kiểm tra nút Next có nên disable không
  let isNextDisabled = true;
  if (currentQuestion.type === "MULTIPLE_CHOICE") {
      isNextDisabled = !answers[currentQuestion.question_id];
  } else if (currentQuestion.type === "FILL_IN_THE_BLANK") {
      const currentAns = answers[currentQuestion.question_id] || [];
      const requiredSlots = currentQuestion.answers?.length || 0;
      const filledCount = currentAns.filter(a => a.answer && a.answer.trim() !== "").length;
      isNextDisabled = filledCount < requiredSlots;
  }

  return (
    <div className="quiz-container">
      <div className="quiz-doing-view">
        <div className="quiz-header-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: '16px', fontWeight: '600' }}>
               ⏳ Thời gian: <span style={{ color: '#ff4d4f' }}>{formatTime(timeLeft)}</span>
            </span>

            <Button 
              type="default" 
              danger 
              icon={<CloseOutlined />} 
              onClick={onClose}
            >
              Thoát
            </Button>
        </div>

        <div>
          <div className="quiz-question-number">Câu số {currentQIndex + 1}</div>
          <h3 className="quiz-question-text" dangerouslySetInnerHTML={{__html: currentQuestion.question_text}}></h3>
          
          {currentQuestion.type === "FILL_IN_THE_BLANK" ? (
             renderFillInBlankInputs(currentQuestion)
          ) : (
             <Radio.Group 
                className="quiz-options-group"
                onChange={(e) => handleSelectMultiChoice(currentQuestion.question_id, e.target.value)}
                value={answers[currentQuestion.question_id]}
              >
                {currentQuestion.answers && currentQuestion.answers.map((opt, idx) => {
                   const answerText = opt.answer || opt.text || (typeof opt === 'string' ? opt : "");
                   return (
                    <Radio key={idx} value={answerText} className="quiz-option-item-radio">
                      <div className="quiz-option-item">{answerText}</div>
                    </Radio>
                   );
                })}
              </Radio.Group>
          )}

        </div>

        <div className="quiz-footer-nav">
          <Button 
            type="primary" 
            size="large" 
            className="quiz-btn-primary"
            style={{height: 48, borderRadius: 8}}
            onClick={handleNext}
            disabled={isNextDisabled}
          >
            {currentQIndex === quizData.questions.length - 1 ? "Nộp bài" : "Câu tiếp theo"} 
            <ArrowRightOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
}