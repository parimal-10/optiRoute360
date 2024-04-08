import { NextResponse } from "next/server";
// const nodes = [
//     // { name: "Start", closingTime: Infinity, waitTime: 0 },
//     // { name: "A", closingTime: 50, waitTime: 10, isMandatory: true },
//     // { name: "B", closingTime: 70, waitTime: 15, isMandatory: true },
//     // { name: "C", closingTime: 100, waitTime: 20 }
// ];

// const edges = [
//     // { from: 0, to: 1, weight: 200 },
//     // { from: 1, to: 0, weight: 200 },
//     // { from: 0, to: 2, weight: 450 },
//     // { from: 2, to: 0, weight: 450 },
//     // { from: 0, to: 3, weight: 70 },
//     // { from: 3, to: 0, weight: 70 },
//     // { from: 1, to: 2, weight: 3 },
//     // { from: 2, to: 1, weight: 3 },
//     // { from: 1, to: 3, weight: 2 },
//     // { from: 3, to: 1, weight: 2 },
//     // { from: 2, to: 3, weight: 10 },
//     // { from: 3, to: 2, weight: 10 }
// ];

function getTimeDifferenceInMinutes(time1, time2) {
    // Parse date strings into Date objects
    const date1 = new Date(time1);
    const date2 = new Date(time2);

    // Calculate the difference in milliseconds
    const differenceInMilliseconds = date2 - date1;

    // Convert milliseconds to minutes
    const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

    // Return the difference in minutes
    return differenceInMinutes;
}

function convertToMinutes(timeString) {
    const regex = /(\d+)\s*(day|hour|min)/g;
    let totalMinutes = 0;

    let match;
    while ((match = regex.exec(timeString)) !== null) {
        const value = parseInt(match[1], 10);
        const unit = match[2];

        switch (unit) {
            case 'day':
                totalMinutes += value * 1440; // 1440 minutes in a day
                break;
            case 'hour':
                totalMinutes += value * 60; // 60 minutes in an hour
                break;
            case 'min0':
                totalMinutes += value;
                break;
            default:
                break; // Unrecognized unit, ignore
        }
    }

    return totalMinutes;
}

function findMaxVisitedNodes(nodes, edges) {
    let maxNodesVisited = 0;
    let currentTime = 0;
    let maxMandatoryVisited = 0;
    let visited = new Array(nodes.length).fill(0);
    let bestPath = [];
    let currentPath = [];
    const totalMandatory = nodes.filter(node => node.isMandatory).length;

    currentPath.push(0); // Start from node 0
    visited[0] = 1; // Mark as visited

    function dfs(currentNode, currentTime, totalVisited, mandatoryVisited) {
        // If current path has more mandatory nodes visited or same but more total nodes visited, update the bestPath
        if (
            mandatoryVisited > maxMandatoryVisited ||
            (mandatoryVisited === maxMandatoryVisited && totalVisited > maxNodesVisited)
        ) {
            maxNodesVisited = totalVisited;
            maxMandatoryVisited = mandatoryVisited;
            bestPath = [...currentPath, currentTime]; // Use last element to store current time for comparison
        }

        for (const edge of edges) {
            if (edge.from === currentNode) {
                const nextNode = edge.to;
                const arrivalTime = currentTime + edge.weight;

                if (
                    !visited[nextNode] &&
                    arrivalTime + nodes[nextNode].waitTime <= nodes[nextNode].closingTime
                ) {
                    visited[nextNode] = 1;
                    currentPath.push(nextNode);

                    dfs(
                        nextNode,
                        arrivalTime + nodes[nextNode].waitTime,
                        totalVisited + 1,
                        mandatoryVisited + (nodes[nextNode].isMandatory ? 1 : 0)
                    );

                    visited[nextNode] = 0;
                    currentPath.pop();
                }
            }
        }
    }

    dfs(0, currentTime, 1, 0);

    return {
        maxNodesVisited,
        maxMandatoryVisited,
        bestPath
    };
}

// const result = findMaxVisitedNodes(nodes, edges);

// console.log("Maximum nodes visited:", result.maxNodesVisited);
// console.log(
//     "Mandatory nodes visited:",
//     result.maxMandatoryVisited + "/" + nodes.filter(node => node.isMandatory).length
// );
// console.log("Path:", result.bestPath.slice(0, -1).map(nodeIndex => nodes[nodeIndex].name).join(" -> "));
// console.log("Total time:", result.bestPath[result.bestPath.length - 1], "minutes");

export async function POST(req) {
    const { initialTime, selectedLoc } = await req.json();
    const selectedLocName = [];
    for (let x of selectedLoc) {
        selectedLocName.push(x.loc.name + " ," + x.loc.formatted_address)
    }
    const originsString = selectedLocName.join('|');
    const destinationsString = selectedLocName.join('|');
    const mapUri = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${encodeURIComponent(destinationsString)}&origins=${encodeURIComponent(originsString)}&units=imperial&key=${process.env.NEXT_PUBLIC_MAP_API_KEY}`;

    try {
        const response = await fetch(mapUri);
        if (!response.ok) {
            throw new Error('Failed to fetch data from Google Distance Matrix API');
        }
        const data = await response.json();
        // console.log(data);
        const nodes = [];

        const edges = [];

        for (let i = 0; i < selectedLoc.length; i++) {
            const x = selectedLoc[i];
            console.log(x.time);
            let closingTime;
            if (i === 0) {
                closingTime = Number.MAX_SAFE_INTEGER;
            } else {
                closingTime = getTimeDifferenceInMinutes(initialTime, x.time);
            }
            nodes.push({
                name: x.loc.name + " ," + x.loc.formatted_address,
                isMandatory: x.isMandatory,
                closingTime: closingTime,
                waitTime: x?.waitTime,
                loc: {
                    lat: x.loc.geometry.location.lat,
                    lng: x.loc.geometry.location.lng
                }
            });
        }

        for (let i = 0; i < data.rows.length; i++) {
            for (let j = 0; j < data.rows[i].elements.length; j++) {
                if (i != j) {
                    const durationElement = data.rows[i].elements[j];
                    console.log(durationElement);
                    let weight;
                    if (durationElement.status === "OK" && durationElement.duration && durationElement.duration.text) {
                        weight = convertToMinutes(durationElement.duration.text);
                    } else {
                        weight = Number.MAX_SAFE_INTEGER;
                    }
                    console.log(weight);
                    edges.push({
                        from: i,
                        to: j,
                        weight: weight
                    })
                }
            }
        }

        console.log(nodes);

        const result = findMaxVisitedNodes(nodes, edges);

        console.log("Maximum nodes visited:", result.maxNodesVisited);
        console.log(
            "Mandatory nodes visited:",
            result.maxMandatoryVisited + "/" + nodes.filter(node => node.isMandatory).length
        );
        console.log("Path:", result.bestPath.slice(0, -1).map(nodeIndex => nodes[nodeIndex].name).join(" -> "));
        console.log("Total time:", result.bestPath[result.bestPath.length - 1], "minutes");

        return NextResponse.json({ result, nodes });
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
