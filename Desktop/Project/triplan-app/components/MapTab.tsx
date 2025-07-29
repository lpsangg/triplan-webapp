import dynamic from "next/dynamic";
const MapTabClient = dynamic(() => import("./MapTabClient"), { ssr: false });
export default MapTabClient; 