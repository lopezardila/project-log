import React, { useState } from 'react';
import Questionnaire from '../questionnaire/Questionnaire';
import './style.css';

const DelayedFlight = (props) => {
  const [currentStep, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const questions = [
    {
      progressName: 'Check your flight for free',
      title: 'Did you originally book a direct flight?',
      question: ['Direct flight', 'With stopovers'],
      questionType: 'radio',
      description: (
        <div>
          <h1 className="description-caption">Let's start</h1>
          <p className="description-content">
            Just a few details about your flight and we will calculate your
            possible compensation claim.
          </p>
        </div>
      )
    },
    {
      progressName: 'Check your flight for free',
      title: 'What was your original itinerary?',
      question: ['Direct flight', 'With stopovers']
    }
  ];
  const onSelect = (selectedItem) => {
    console.log(selectedItem);
  };

  const handleBackBtnClick = () => {
    currentStep > 0 && setStep(currentStep - 1);
  };
  const handleNextBtnClick = () => {
    currentStep < questions.length - 1 && setStep(Number(currentStep) + 1);
  };
  const handleQuestionSelected = (selectedItem) => {
    let temp = [...answers];
    temp[currentStep] = selectedItem;
    setAnswers(temp);
  };
  return (
    <section className="main-container">
      <Questionnaire
        currentStep={currentStep}
        questions={questions}
        answers={answers}
        onQuestionSelected={handleQuestionSelected}
        onNextBtnClick={handleNextBtnClick}
        onBackBtnClick={handleBackBtnClick}
      ></Questionnaire>
    </section>
  );
};

export default DelayedFlight;
