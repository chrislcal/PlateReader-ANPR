import React from "react";

const Sidebar = ({ carInfo, plateNumber, errorMessage, handleGetInfo, captureInterval }) => {
  
  return (
    <div className="sidebar-container">
      <div className="info-container">
      {errorMessage ? (
        <h2 className="error-message">{errorMessage}</h2>
        ) : (
          <>
          <h1>{plateNumber.toUpperCase()}</h1>
          {carInfo && carInfo.make && carInfo.brand && (
            <div>
              <p>{`${carInfo.brand} ${carInfo.make}`}</p>
              <p>{carInfo.year}</p>
              <p>{`${carInfo.cylinder} ${carInfo.fuel}`}</p>
              <p>{`${carInfo.effect}hk ${carInfo.transmission}`}</p>
              <p>{`Maks hastighet: ${carInfo.maxSpeed} km/h`}</p>
              <p>{`Hjuldrift: ${carInfo.wheelDrive}`}</p>
              <p>{`Farge: ${carInfo.color}`}</p>
              <p>{`Bredde: ${carInfo.width / 1000} m`}</p>
              <p>{`Lengde: ${carInfo.length / 1000} m`}</p>
            </div>
          )}
        </>
      )}
      </div>
        <button className="get-info" onClick={handleGetInfo}>
          {captureInterval ? "STOP" : "CAPTURE"}
        </button>
      </div>  
    // </div>
  );
};

export default Sidebar;