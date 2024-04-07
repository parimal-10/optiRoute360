"use client"
import { useEffect, useState } from "react";

export default function Result() {
    const [result, setResult] = useState(null);
    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('routeData'));
        console.log(data);
        setResult(data)
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
            {result &&
                result.bestPath.map((nodeIndex, index) => (
                    <div>
                        <Typography>
                            {result.nodes[nodeIndex].name}
                        </Typography>
                    </div>
                ))
            }
        </div>
    )
}