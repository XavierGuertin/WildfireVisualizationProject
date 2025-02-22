// import { useEffect, useState } from "react";

// const OnlineStatus = () => {
//   const [isOnline, setOnline] = useState(navigator.onLine)

//   const updateOnlineStatus = () => {
//     setOnline(navigator.onLine);
//     console.log(navigator.onLine);
//   };

//   useEffect(() => {
//     window.addEventListener("online", updateOnlineStatus);
//     window.addEventListener("offline", updateOnlineStatus);

//     return () => {
//         window.removeEventListener("online", updateOnlineStatus);
//         window.removeEventListener("offline", updateOnlineStatus);
//     };
//   }, [navigator.onLine]);

//   return { isOnline };
// };

// export default OnlineStatus;

