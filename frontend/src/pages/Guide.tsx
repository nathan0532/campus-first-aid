import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Play, 
  BarChart3,
  Trophy,
  Clock
} from 'lucide-react';

const Guide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          欢迎使用急救训练模拟器
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          通过互动式训练掌握CPR和海姆立克急救技能
        </p>
      </div>

      {/* Getting Started Steps */}
      <div className="bg-white rounded-xl p-8 shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">快速开始</h2>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">1</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">选择训练场景</h3>
              <p className="text-gray-600">
                从CPR（心肺复苏）或海姆立克急救法中选择一个场景开始训练
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">跟随指引操作</h3>
              <p className="text-gray-600">
                按照屏幕提示完成每个训练步骤，系统会实时给出反馈和指导
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">获得评分反馈</h3>
              <p className="text-gray-600">
                训练完成后查看详细评分和改进建议，在个人信息页面追踪进度
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Training Modules */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* CPR Training */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">CPR训练</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            学习标准心肺复苏术，包括胸外按压和人工呼吸的正确方法。
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">胸外按压技术</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">人工呼吸方法</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">按压深度和频率</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">实时操作反馈</span>
            </div>
          </div>

          <Link
            to="/cpr"
            className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            <span>开始CPR训练</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Heimlich Training */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">海姆立克急救法</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            掌握处理气道异物阻塞的正确手法，学会在紧急时刻挽救生命。
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">识别窒息症状</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">正确体位摆放</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">腹部冲击手法</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">急救流程掌握</span>
            </div>
          </div>

          <Link
            to="/heimlich"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            <span>开始海姆立克训练</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl p-8 shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          训练系统特色
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-3 bg-orange-100 rounded-lg w-fit mx-auto mb-3">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">实时反馈</h3>
            <p className="text-gray-600 text-sm">
              每个操作步骤都有即时反馈，帮助你及时纠正错误
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">进度跟踪</h3>
            <p className="text-gray-600 text-sm">
              详细记录训练历史，可视化展示技能掌握进度
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">成就系统</h3>
            <p className="text-gray-600 text-sm">
              通过排行榜和成绩评分，激励持续学习和改进
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-blue-500 to-red-500 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">开始你的急救技能训练</h2>
        <p className="text-blue-100 mb-6">
          掌握急救技能，在关键时刻拯救生命
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link
            to="/cpr"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            开始CPR训练
          </Link>
          <Link
            to="/heimlich"
            className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30"
          >
            开始海姆立克训练
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Guide;