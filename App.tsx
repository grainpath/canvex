/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './src/pages/Home';
import About from './src/pages/About';
import Header from './components/Header';
import Footer from './src/components/Footer';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen text-gray-100 flex flex-col bg-[#0f1115]">
        <Header />
        <main className="flex-grow w-full max-w-[1600px] mx-auto p-4 md:p-8 flex justify-center items-start">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
