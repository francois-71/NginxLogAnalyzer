import React, { useState } from "react";
import "./NginxLogger.css"; // Import the stylesheet

const NginxLogger = () => {
  const [file, setFile] = useState(null);
  const [hashableList, setHashableList] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedIP, setSelectedIP] = useState(null);
  const [dataDetail, setDataDetail] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataSendingPOST, setDataSendingPOST] = useState(false);
  const [dataUploaded, setDataUploaded] = useState(false);
  const [errors, setErrors] = useState({ error: [] });
  const [hasErrors, setHasErrors] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setDataLoaded(false);
  };

  const handleErrors = (errorData) => {
    setErrors({ error: errorData });
    setHasErrors(errorData.length > 0); // Check if errorData has elements
  };

  const resetErrors = () => {
    setErrors({ error: [] }); // Clear the errors
    setHasErrors(false); // Set hasErrors to false
  };
  

  const handleUpload = async () => {
    resetErrors();
    if (file) {
      try {
        setDataSendingPOST(true);
        const formData = new FormData();
        formData.append("file", file);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Request timed out"));
          }, 6000); // 6sec timeout
        });
        const response = await Promise.race([
          fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData,
          }),
          timeoutPromise,
        ]);
        if (!response.ok) {
          const errorData = await response.json();
          handleErrors(errorData.errors); // Pass the received error data to handleErrors
          return; // Exit function or handle further based on the error
        }
        setDataSendingPOST(false);
        setDataUploaded(true);
      } catch (error) {
        console.error("Error uploading file:", error);
        handleErrors(["There was an error uploading your file."]);
      }
    }
  };

  const handleGetData = async () => {
    resetErrors();
    setDataLoaded(false);
    setHashableList(null);
    try {
      setIsDataLoading(true);
      const response = await fetch("http://localhost:5000/analyze");
      const data = await response.json();
      setHashableList(data);
      setDataLoaded(true);
      setDataSendingPOST(false);
      if (!response.ok) {
        const errorData = await response.json();
        handleErrors(errorData.errors); // Pass the received error data to handleErrors
        return; // Exit function or handle further based on the error
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      handleErrors(["There was an error uploading your file."]);
    }
  };

  const askDataDetail = async (ipAddress) => {
    resetErrors();
    try {
      const url = `http://localhost:5000/get_specific_info?ip=${ipAddress}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        handleErrors(errorData.errors); // Pass the received error data to handleErrors
        return; // Exit function or handle further based on the error
      }
  
      const responseData = await response.json(); // Parse response data
  
      console.log(responseData);
      setSelectedIP(ipAddress);
      setDataDetail(responseData);
    } catch (error) {
      console.error("Error retrieving specific info:", error);
      handleErrors(["There was an error retrieving specific info."]);
    }
  };
  

  return (
    <div className="container">
      <h1 className="container-title">Analyze your NGINX server logs</h1>

      <div className="upload-section">
        <input
          type="file"
          accept=".txt"
          id="file"
          onChange={handleFileChange}
          className="file-input"
        />
        <button className="button" onClick={handleUpload}>
          Upload File
        </button>
        <button className="button" onClick={handleGetData}>
          Get Data
        </button>
      </div>

      {hasErrors ? (
        <div className="error-message">
          <p>
            There was an error:{" "}
            {errors.error.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </p>
        </div>
      ) : !dataLoaded && dataSendingPOST ? (
        <div className="data-loading-message">
          <p>Your data is being uploaded...</p>
        </div>
      ) : !dataLoaded && !dataSendingPOST && dataUploaded ? (
        <div className="data-loading-message">
          <p>Your data has been uploaded successfully!</p>
        </div>
      ) : !dataLoaded && isDataLoading ? (
        <div className="data-loading-message">
          <p>Your data is being analyzed...</p>
        </div>
      ) : dataLoaded ? (
        <div className="data-loaded-message">
          <p>Your data has been loaded successfully!</p>
          {hashableList && (
            <div>
              <h2>Loaded Data:</h2>
              <ul className="data-list">
                {hashableList.data.map((item, index) => (
                  <li key={index} className="data-item">
                    <span className="data-label-ip">IP: {item[0]}</span> |
                    <span className="data-label-method">
                      {" "}
                      Method: {item[1]}
                    </span>{" "}
                    |<span className="data-label-date"> Date: {item[2]}</span>
                    <button
                      className="button-view-info"
                      onClick={() => askDataDetail(item[0])} // Pass IP address to askDataDetail function
                    >
                      View Details
                    </button>
                    {dataDetail && selectedIP === item[0] && (
                      <div>
                        <h3>Details:</h3>
                        <ul className="data-list">
                          <li className="data-item">
                            <span className="data-label"> Country:</span>
                            {dataDetail.data.country_name} |
                            <span className="data-label"> City:</span>
                            {dataDetail.data.city} |
                            <span className="data-label"> Continent Code:</span>
                            {dataDetail.data.continent_code} |
                            <span className="data-label"> Flag: </span>
                            <img
                              src={dataDetail.data.country_flag}
                              alt="Flag"
                              className="flag"
                            />{" "}
                            |<span className="data-label"> ISP: </span>
                            {dataDetail.data.isp}
                          </li>
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default NginxLogger;
