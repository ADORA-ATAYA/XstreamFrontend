import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './css/App.css';
import {useDispatch, useSelector } from 'react-redux'
import Home from './components/Home';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import { useEffect } from 'react';
import { listenToAuthChanges } from './redux/slices/authSlice';
import StreamWindow from './components/StreamWindow';
import SecondWindow from './components/SecondWindow';
import Footer from './components/Footer';

function App() {

  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.isLoading);

  useEffect(() => {
    dispatch(listenToAuthChanges());
  }, [dispatch])

  if(isLoading){
    return (
      <div className="text-center mt-10 text-xl">Loading...</div>
    )
  }
  
  return (
    <BrowserRouter>
      <Navbar /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/streamwindow" element={<StreamWindow />} />
        <Route path="/secondwindow" element={<SecondWindow/>}  />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
