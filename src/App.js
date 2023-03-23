import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Detector from './components/Detector';

import './styles/styles.css';


const App = () => {

  const [plateNumber, setPlateNumber] = useState('');
  const [carInfo, setCarInfo] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);

  const handleData = (car, plate, error) => {
    console.log('Data received in App.js:');
    console.log(car, plate, error);

    if (car) {
      setCarInfo(car);
    }
    if (plate) {
      setPlateNumber(plate);
    }
    if (error) {
      setErrorMessage(error);
    }
  };


  return (
    <div className='main-container'>
      <Detector handleData={handleData}/>
      <Sidebar carData={carInfo} plateData={plateNumber} errorMessage={errorMessage}/>
    </div>
  );
}
 
export default App;