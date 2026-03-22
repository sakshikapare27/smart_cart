import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import ShoppingCart from './pages/shoppingCart';
import QRScanner from './components/QRScanner';

const App: React.FC = () => {
  return (
    <Authenticator>
      {({ signOut }) => (
        <Router>
          <Routes>
            <Route path="/" element={<ShoppingCart signOut={signOut} />} />
            <Route path="/scan" element={<QRScanner />} />
          </Routes>
        </Router>
      )}
    </Authenticator>
  );
};

export default App;


