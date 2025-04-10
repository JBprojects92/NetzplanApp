document.addEventListener('DOMContentLoaded', () => {
    console.log("netzplan.js loaded");

    const modelstring = document.getElementById("hiddenMessage").value;
    const direction = document.getElementById("hiddenDirection").value || 'LR';
    var g = new dagreD3.graphlib.Graph().setGraph({});
    const svg = d3.select("#netzplanSvg");
    const inner = svg.select("g");
    const svgCanvas = document.getElementById('svgcanvas');

    if (modelstring === null) {
        console.log("Model is null");
        return;
    }

    try {
        model = JSON.parse(modelstring);
        if (!Array.isArray(model) || model.length === 0) {
            console.log("Parsed model is not a non-empty array.");
            svgCanvas.innerHTML = '<p class="text-warning">Graph data is empty or invalid.</p>';
            return;
        }
    } catch (e) {
        console.log("Failed to parse model:", e);
        svgCanvas.innerHTML = `<p class="text-danger">Error parsing graph data: ${e.message}</p>`;
        return;
    }

    g.graph().rankdir = direction;
    g.graph().nodesep = 200;
    g.graph().ranksep = 50;
    g.graph().edgesep = 30;
    g.graph().marginx = 20;
    g.graph().marginy = 20;

    model.forEach(function (knoten) {
        let tableHTML =
            `<table>
                <tr>
                    <td colspan="2">FAZ: ${knoten.FAZ}</td>
                    <td colspan="2">FEZ: ${knoten.FEZ}</td>
                </tr>
                <tr>
                    <td>${knoten.Vorgang}</td>
                    <td colspan="3">${knoten.Beschreibung}</td>
                </tr>
                <tr>
                    <td colspan="2">Dauer: ${knoten.Dauer}</td>
                    <td>GP: ${knoten.GP}</td>
                    <td>FP: ${knoten.FP}</td>
                </tr>
                <tr>
                    <td colspan="2">SAZ: ${knoten.SAZ}</td>
                    <td colspan="2">SEZ: ${knoten.SEZ}</td>
                </tr>
            </table>`

        if (knoten.Critical === true) {
            g.setNode(knoten.Vorgang, {
                labelType: "html",
                label: tableHTML,
                style: "stroke: #C96442; stroke-width: 2px; fill: #212529;"
            });
        }
        else {
            g.setNode(knoten.Vorgang, {
                labelType: "html",
                label: tableHTML,
                style: "stroke: #CCCCCC; stroke-width: 2px; fill: #212529;"
            });
        }
    });

    model.forEach(function (knoten) {
        if (knoten.Vorgänger) {
            knoten.Vorgänger.forEach(function (prev) {
                g.setEdge(prev.Vorgang, knoten.Vorgang, {
                    label: "",
                    style: "stroke: #CCC; stroke-width: 2px; fill: none;",
                    arrowheadStyle: "fill: #CCC; stroke: none;",
                    curve: d3.curveBasis,
                    arrowhead: "normal",
                    arrowheadClass: 'arrowhead'
                });
            })
        }
    });

    g.nodes().forEach(function (v) {
        var node = g.node(v);
        node.rx = node.ry = 5;
    });

    inner.selectAll('*').remove();

    const render = new dagreD3.render();

    try {
        render(inner, g);
    } catch (renderError) {
        console.error("DagreD3 rendering failed:", renderError);
        svgCanvas.innerHTML = '<p class="text-danger">Error rendering graph.</p>';
        return;
    }

    inner.selectAll("g.node").each(function (v) {
        const nodeData = g.node(v);
        if (nodeData && nodeData.originalData && nodeData.originalData.Critical === true) {
            d3.select(this).classed('critical', true);
        }
    });

    const zoom = d3.zoom().on("zoom", (event) => {
        inner.attr("transform", event.transform);
    });

    svg.call(zoom);

    let graphWidth, graphHeight, graphBBox;

    try {
        graphBBox = inner.node().getBBox();
        graphWidth = graphBBox.width;
        graphHeight = graphBBox.height;

        if (graphWidth < 1 || graphHeight < 1) {
            console.warn("Graph BBox has zero or near-zero dimensions. Using Dagre estimates.", graphBBox);

            graphWidth = g.graph().width > 1 ? g.graph().width : 200;
            graphHeight = g.graph().height > 1 ? g.graph().height : 100;

            graphBBox = { x: 0, y: 0, width: graphWidth, height: graphHeight };
        }
    } catch (e) {
        console.error("Could not get BBox of rendered graph. Using Dagre's estimates.", e);

        graphWidth = g.graph().width > 1 ? g.graph().width : 200;
        graphHeight = g.graph().height > 1 ? g.graph().height : 100;
        graphBBox = { x: 0, y: 0, width: graphWidth, height: graphHeight };
    }

    const containerWidth = svgCanvas.clientWidth;
    const containerHeight = Math.max(svgCanvas.clientHeight, 400);

    console.log("Container W/H:", containerWidth, containerHeight);
    console.log("Graph BBox:", graphBBox);

    const padding = 80;
    const scaleX = (containerWidth - padding) / graphWidth;
    const scaleY = (containerHeight - padding) / graphHeight;
    let initialScale = Math.min(scaleX, scaleY);

    initialScale = Math.min(initialScale, 1.0);

    initialScale = Math.max(initialScale, 0.1);

    // Calculate translation to center the graph
    const translateX = (containerWidth / 2) - (graphBBox.x + graphWidth / 2) * initialScale;
    const translateY = (containerHeight / 2) - (graphBBox.y + graphHeight / 2) * initialScale;

    console.log("Calculated Initial Scale:", initialScale);
    console.log("Calculated Translate X/Y:", translateX, translateY);

    if (isNaN(initialScale) || !isFinite(initialScale) || initialScale <= 0 ||
        isNaN(translateX) || !isFinite(translateX) ||
        isNaN(translateY) || !isFinite(translateY)) {
        console.error("Invalid zoom/transform parameters calculated. Applying default.", { initialScale, translateX, translateY });

        svg.call(zoom.transform, d3.zoomIdentity.translate(40, 40).scale(0.8));
    } else {
        const initialTransform = d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(initialScale);

        svg.call(zoom.transform, initialTransform);
    }

    // --- Store original data with node ---
    model.forEach(knoten => {
        if (g.hasNode(knoten.Vorgang)) {
            const node = g.node(knoten.Vorgang);
            node.originalData = knoten;
        }
    });

    var svgData = getSvgData();
    const svgElement = document.getElementById('netzplanSvg');
    var svgClone = svgElement.cloneNode(true);

    const downloadButton = document.getElementById('dlbutton');
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            downloadSVG(svgData);
        });
    }

    const downloadButtonPng = document.getElementById('dlbuttonpng');
    if (downloadButtonPng) {
        downloadButtonPng.addEventListener('click', () => {
            downloadAsPNG(svgData, svgClone);
        });
    }
});

function getSvgData() {
    try {
        const svgElement = document.getElementById('netzplanSvg');

        // Clone the SVG to avoid modifying the visible one
        const svgClone = svgElement.cloneNode(true);

        svgClone.setAttribute('width', svgElement.clientWidth);
        svgClone.setAttribute('height', svgElement.clientHeight);

        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

        const styleElement = document.createElement('style');
        let cssText = `
            .node {
                display: flex;
                justify-content: center;
                width: max-content;
            }
            .node rect {
                stroke: #CCC;
                stroke-width: 2px;
                fill: #212529;
            }
            .node.critical rect {
                stroke: #C96442;
                stroke-width: 2px;
            }
            .edgePath path {
                stroke: #CCC;
                stroke-width: 2px;
                fill: none;
            }
            .edgePath path.path {
                stroke: #CCC;
                stroke-width: 2px;
                fill: none;
            }
            .arrowhead {
                fill: #CCC;
            }
            marker > path {
                fill: #CCC !important;
                stroke: none !important;
            }
            marker path {
                fill: #CCC !important;
                stroke: none !important;
            }
            div {
                width: 100%;
                height: 100%;
            }
            table {
                border: 1px solid #495057;
                border-collapse: collapse;
                width: 100%;
                height: 100%;
            }
            td {
                border: 1px solid #495057;
                padding: 8px;
                text-align: center;
                min-width: 40px;
                white-space: nowrap;
                color: white;
                font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
                font-size: 14px;
            }
        `;

        const stylesheets = document.styleSheets;

        try {
            for (let i = 0; i < stylesheets.length; i++) {
                const sheet = stylesheets[i];
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    if (rules) {
                        for (let j = 0; j < rules.length; j++) {
                            const rule = rules[j];
                            if (rule.selectorText &&
                                (rule.selectorText.includes('svg') ||
                                    rule.selectorText.includes('table') ||
                                    rule.selectorText.includes('td') ||
                                    rule.selectorText.includes('node') ||
                                    rule.selectorText.includes('foreignObject') ||
                                    rule.selectorText.includes('edge'))) {
                                cssText += rule.cssText + '\n';
                            }
                        }
                    }
                } catch (e) {
                    console.warn("Couldn't access rules from stylesheet", e);
                }
            }
        } catch (e) {
            console.warn("Error processing stylesheets", e);
        }

        styleElement.textContent = cssText;
        svgClone.insertBefore(styleElement, svgClone.firstChild);

        const criticalNodes = svgClone.querySelectorAll('.critical rect');
        criticalNodes.forEach(rect => {
            rect.setAttribute('style', 'stroke: #C96442; stroke-width: 2px; fill: #212529;');
        });

        const svgData = new XMLSerializer().serializeToString(svgClone);

        return svgData;
    } catch (error) {
        console.error("Fehler beim Serilisieren der SVG", error);
    }
}

function downloadSVG(svgData) {
    try {
        // Get SVG as a string
        //const svgData = getSvgData();

        // Create a blob with the SVG data
        const blob = new Blob([svgData], { type: 'image/svg+xml' });

        // Create a URL for the blob
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'netzplan.svg';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        console.log("SVG download initiated");
    } catch (error) {
        console.error("Error downloading SVG:", error);
    }
}

function downloadAsPNG(svgData, svgClone) {
    try {
        // Get the SVG element
        const svgElement = document.getElementById('netzplanSvg');

        // Clone the SVG to avoid modifying the visible one
        //const svgClone = svgElement.cloneNode(true);

        //const svgData = getSvgData();

        // Create a canvas element to draw the SVG
        const canvas = document.createElement('canvas');
        const bbox = svgClone.getBBox();
        const svgWidth = svgElement.clientWidth || bbox.width;
        const svgHeight = svgElement.clientHeight || bbox.height;

        // Set canvas dimensions
        const scale = 2; // Scale for better quality
        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;

        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);

        // Create an image from the SVG data
        const img = new Image();

        img.onload = function () {
            // Draw the image on the canvas
            ctx.fillStyle = '#121212';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            // Convert canvas to PNG
            const pngData = canvas.toDataURL('image/png');

            // Create a link and trigger download
            const a = document.createElement('a');
            a.href = pngData;
            a.download = 'netzplan.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        // Set the source of the image to the SVG data
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
        console.error("Error downloading PNG:", error);
    }
};