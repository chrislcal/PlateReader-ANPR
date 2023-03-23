import React from "react";

const Sidebar = ({ carInfo, plateNumber, errorMessage }) => {
  console.log("Props received in Sidebar component:");
  console.log(carInfo, plateNumber, errorMessage);
  return (
    <div className="sidebar-container">
      {errorMessage ? (
        <h2 className="error-message">{errorMessage}</h2>
      ) : (
        <>
          <h1>{plateNumber}</h1>
          {carInfo && carInfo.make && carInfo.brand && (
            <div>
              <p>{`Make: ${carInfo.make}`}</p>
              <p>{`Brand: ${carInfo.brand}`}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar;