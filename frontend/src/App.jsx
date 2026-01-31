import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import FarmerDashboard from './pages/FarmerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OrderHistory from './pages/OrderHistory';
import LogisticsTracking from './pages/LogisticsTracking';

const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (roles && !roles.includes(userRole)) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/farmer-dashboard"
          element={
            <PrivateRoute roles={['FARMER', 'ADMIN']}>
              <FarmerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute roles={['ADMIN']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <OrderHistory />
            </PrivateRoute>
          }
        />

        <Route
          path="/track/:orderId"
          element={
            <PrivateRoute>
              <LogisticsTracking />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
