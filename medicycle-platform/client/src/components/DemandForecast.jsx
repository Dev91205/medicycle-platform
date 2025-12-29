import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader } from 'lucide-react';

export default function DemandForecast() {
  const [prediction, setPrediction] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [training, setTraining] = useState(true);

  // 1️⃣ HISTORICAL DATA (Mocking past usage)
  // Month 1 = Jan, Month 2 = Feb, etc.
  const rawData = [
    { month: 1, label: 'Jan', demand: 40 },
    { month: 2, label: 'Feb', demand: 45 },
    { month: 3, label: 'Mar', demand: 60 },
    { month: 4, label: 'Apr', demand: 65 },
    { month: 5, label: 'May', demand: 80 },
    { month: 6, label: 'Jun', demand: 95 },
  ];

  useEffect(() => {
    runPrediction();
  }, []);

  const runPrediction = async () => {
    // --- TENSORFLOW LOGIC START ---
    
    // 1. Prepare Data
    // X axis (Inputs) = Months [1, 2, 3...]
    // Y axis (Outputs) = Demand [40, 45, 60...]
    const inputs = rawData.map(d => d.month);
    const labels = rawData.map(d => d.demand);

    const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    // 2. Create Model (Linear Regression)
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [1], units: 1 })); // 1 input -> 1 output

    // 3. Compile Model
    model.compile({ optimizer: tf.train.sgd(0.01), loss: 'meanSquaredError' });

    // 4. Train Model (Epochs = loops to learn)
    await model.fit(inputTensor, labelTensor, {
      epochs: 100,
      shuffle: true
    });

    // 5. Predict Future (Next Month = Month 7)
    const nextMonth = 7;
    const predictionTensor = model.predict(tf.tensor2d([nextMonth], [1, 1]));
    const predictedValue = predictionTensor.dataSync()[0];

    // --- TENSORFLOW LOGIC END ---

    // Clean up memory
    inputTensor.dispose();
    labelTensor.dispose();
    predictionTensor.dispose();

    // Update UI
    setPrediction(Math.round(predictedValue));
    
    // Add prediction to chart data
    const newData = [
      ...rawData,
      { month: 7, label: 'Jul (AI)', demand: Math.round(predictedValue), isPrediction: true }
    ];
    setChartData(newData);
    setTraining(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-purple-600" size={20} />
            AI Demand Forecast
          </h3>
          <p className="text-sm text-gray-500">Predicting next month's stock needs</p>
        </div>
        
        {training ? (
          <div className="flex items-center gap-2 text-purple-600 text-sm font-medium animate-pulse">
            <Loader size={16} className="animate-spin" /> Training Model...
          </div>
        ) : (
          <div className="text-right">
            <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider">Projected Demand</span>
            <span className="text-3xl font-bold text-purple-600">{prediction} Units</span>
          </div>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="demand" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}