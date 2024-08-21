import React, { Fragment, useEffect, useState } from 'react';
import Row from '../common/Row';
import Col from '../common/Col';
import Progress from '../common/Progress';
// import { Row, Col, Progress, Radio, Button } from 'antd';
import './style.css';

const Questionnaire = (props) => {
  const { questions, answers, currentStep } = props;
  const handleQuestionSelected = props.onQuestionSelected;
  const isSelected = answers[currentStep] !== undefined ? true : false;

  return (
    <div className="question-container">
      <Row>
        <Col span={12} className="progress-container">
          <h3 className="progress-label">
            {questions[currentStep].progressName}
          </h3>
          <Progress
            progress={(Number(currentStep) * 100) / questions.length}
          ></Progress>
        </Col>
        {questions[currentStep].description ? (
          <Col span="12">{questions[currentStep].description}</Col>
        ) : null}
        <Col span={12}>
          <h1 className="progress-title">{questions[currentStep].title}</h1>
        </Col>
        <Col span={12}>
          {questions[currentStep].question.map((question, index) => (
            <label
              key={'question_' + index}
              className={
                'question-card' +
                (isSelected && index == answers[currentStep]
                  ? ' question-card-selected'
                  : '')
              }
              htmlFor={'radio' + index}
              onClick={() => handleQuestionSelected(index)}
            >
              {questions[currentStep].questionType &&
              questions[currentStep].questionType == 'radio' ? (
                <Fragment>
                  <input
                    type="radio"
                    value={index}
                    id={'radio' + index}
                    name="question_radio"
                  />
                  <span>{question}</span>
                </Fragment>
              ) : (
                question
              )}
            </label>
          ))}
        </Col>
      </Row>
      <Row>
        <Col span={12} className="btn-toolbar">
          <button className="btn btn-back" onClick={props.onBackBtnClick}>
            Back
          </button>
          <button
            className="btn"
            onClick={props.onNextBtnClick}
            disabled={!isSelected}
          >
            Next
          </button>
        </Col>
      </Row>
    </div>
  );
};

export default Questionnaire;
