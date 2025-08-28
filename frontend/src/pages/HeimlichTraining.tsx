import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import HeimlichSimulator from '../components/HeimlichTraining/HeimlichSimulator';

const HeimlichTraining: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTraining, setIsTraining] = useState(false);

  const steps = [
    {
      id: 'identify-choking',
      name: '识别窒息',
      description: '观察是否有无法说话、呼吸困难、面部发紫等症状',
      instruction: '点击识别窒息症状'
    },
    {
      id: 'position-behind',
      name: '站立定位',
      description: '站在患者身后，双臂环抱患者腰部',
      instruction: '点击正确的站立位置'
    },
    {
      id: 'hand-position',
      name: '手部定位',
      description: '一手握拳，拳眼对准脐上两横指处',
      instruction: '拖拽手部到正确位置'
    },
    {
      id: 'abdominal-thrust',
      name: '腹部冲击',
      description: '另一手抱住拳头，快速向内上方冲击',
      instruction: '连续进行5次有力冲击'
    }
  ];

  const startTraining = () => {
    setIsTraining(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 训练完成，跳转到结果页面
      window.location.href = '/results?type=heimlich';
    }
  };

  const resetTraining = () => {
    setIsTraining(false);
    setCurrentStep(0);
  };

  if (!isTraining) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-800">
            <ArrowLeft className="h-5 w-5 mr-2" />
            返回首页
          </Link>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              海姆立克急救法训练
            </h1>
            <p className="text-lg text-gray-600">
              学习正确的窒息急救操作，掌握"生命的拥抱"
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">训练内容</h3>
              <ul className="space-y-3">
                {steps.map((step, index) => (
                  <li key={step.id} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">{step.name}</div>
                      <div className="text-sm text-gray-600">{step.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">窒息症状识别</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 无法说话或发出声音</li>
                <li>• 呼吸困难或无法呼吸</li>
                <li>• 面部、嘴唇发紫</li>
                <li>• 双手抓住颈部</li>
                <li>• 恐慌、焦虑表情</li>
              </ul>
              
              <h4 className="text-lg font-semibold mt-4 mb-2">操作要点</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 冲击位置：脐上两横指</li>
                <li>• 冲击方向：向内上方</li>
                <li>• 冲击频率：快速有力</li>
                <li>• 持续观察：异物是否排出</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={startTraining}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="h-5 w-5 mr-2" />
              开始训练
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>
      <HeimlichSimulator />
    </div>
  );
};

export default HeimlichTraining;