"use client"
import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography"

export default function Result() {
    const [resultData, setResultData] = useState(null);
    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('routeData'));
        console.log(data);
        if (data) {
            setResultData(data)
        }
        // Use the data as needed
        // localStorage.removeItem('routeData'); // Clean up
    }, []);
    // console.log("Maximum nodes visited:", result.maxNodesVisited);
    // console.log(
    //     "Mandatory nodes visited:",
    //     result.maxMandatoryVisited + "/" + nodes.filter(node => node.isMandatory).length
    // );
    // console.log("Path:", result.bestPath.slice(0, -1).map(nodeIndex => nodes[nodeIndex].name).join(" -> "));
    // console.log("Total time:", result.bestPath[result.bestPath.length - 1], "minutes");
    return (
        <div>
            {resultData &&
                resultData.result.bestPath.slice(0, -1).map((nodeIndex, index) => (
                    <div className="bg-gray-400 mb-3">
                        <Typography>
                            {resultData.nodes[nodeIndex].name}
                        </Typography>
                    </div>
                ))
            }
        </div>
    )
}