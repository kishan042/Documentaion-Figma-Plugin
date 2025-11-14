console.log("[PLUGIN INIT] Plugin code.js loaded and starting");

figma.showUI(__html__, {
  width: 432,
  height: 810,
  title: "Design System Check"
});

console.log("[PLUGIN INIT] UI shown");

function extractStyles(node) {
  var styles = [];
  console.log("[extractStyles] Starting extraction for node:", node.name);
  console.log("[extractStyles] Node type:", node.type);
  console.log("[extractStyles] Has fills property:", "fills" in node);
  console.log("[extractStyles] Has strokes property:", "strokes" in node);
  console.log("[extractStyles] Has effects property:", "effects" in node);

  try {
    // Check fills - need to check if fills are visible
    if ("fills" in node) {
      console.log("[extractStyles] Checking fills, type:", typeof node.fills);
      var fills = node.fills;
      if (fills === figma.mixed) {
        console.log("[extractStyles] Fills are mixed");
        styles.push("Fill: Mixed");
      } else if (Array.isArray(fills)) {
        console.log("[extractStyles] Fills array length:", fills.length);
        for (var i = 0; i < fills.length; i += 1) {
          var fill = fills[i];
          console.log("[extractStyles] Fill", i, "type:", fill ? fill.type : "null");
          if (fill && fill.visible !== false) {
            if (fill.type === "SOLID" && fill.color) {
              var r = Math.round(fill.color.r * 255);
              var g = Math.round(fill.color.g * 255);
              var b = Math.round(fill.color.b * 255);
              var opacity = fill.opacity !== undefined ? fill.opacity : 1;
              if (opacity < 1) {
                styles.push("Fill: rgba(" + r + ", " + g + ", " + b + ", " + opacity.toFixed(2) + ")");
              } else {
                styles.push("Fill: rgb(" + r + ", " + g + ", " + b + ")");
              }
            } else if (fill.type === "GRADIENT_LINEAR" || fill.type === "GRADIENT_RADIAL" || fill.type === "GRADIENT_ANGULAR" || fill.type === "GRADIENT_DIAMOND") {
              styles.push("Fill: " + fill.type);
            } else if (fill.type === "IMAGE") {
              styles.push("Fill: Image");
            }
          }
        }
      }
    } else {
      console.log("[extractStyles] No fills property");
    }
  } catch (e) {
    console.log("[extractStyles] Error accessing fills:", e);
  }

  try {
    // Check strokes
    if ("strokes" in node) {
      console.log("[extractStyles] Checking strokes, type:", typeof node.strokes);
      var strokes = node.strokes;
      if (strokes === figma.mixed) {
        console.log("[extractStyles] Strokes are mixed");
        styles.push("Stroke: Mixed");
      } else if (Array.isArray(strokes)) {
        console.log("[extractStyles] Strokes array length:", strokes.length);
        for (var i = 0; i < strokes.length; i += 1) {
          var stroke = strokes[i];
          console.log("[extractStyles] Stroke", i, "type:", stroke ? stroke.type : "null");
          if (stroke && stroke.visible !== false) {
            if (stroke.type === "SOLID" && stroke.color) {
              var r = Math.round(stroke.color.r * 255);
              var g = Math.round(stroke.color.g * 255);
              var b = Math.round(stroke.color.b * 255);
              var opacity = stroke.opacity !== undefined ? stroke.opacity : 1;
              var weight = "strokeWeight" in node ? node.strokeWeight : "unknown";
              if (opacity < 1) {
                styles.push("Stroke: rgba(" + r + ", " + g + ", " + b + ", " + opacity.toFixed(2) + ") " + weight + "px");
              } else {
                styles.push("Stroke: rgb(" + r + ", " + g + ", " + b + ") " + weight + "px");
              }
            } else if (stroke.type) {
              styles.push("Stroke: " + stroke.type);
            }
          }
        }
      }
    } else {
      console.log("[extractStyles] No strokes property");
    }
  } catch (e) {
    console.log("[extractStyles] Error accessing strokes:", e);
  }

  try {
    // Check effects
    if ("effects" in node && Array.isArray(node.effects)) {
      console.log("[extractStyles] Effects array length:", node.effects.length);
      for (var i = 0; i < node.effects.length; i += 1) {
        var effect = node.effects[i];
        if (effect && effect.visible !== false && effect.type) {
          var effectDesc = "Effect: " + effect.type;
          if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
            effectDesc += " (" + effect.offset.x + ", " + effect.offset.y + ")";
          }
          styles.push(effectDesc);
        }
      }
    }
  } catch (e) {
    console.log("[extractStyles] Error accessing effects:", e);
  }

  try {
    // Check font
    if ("fontName" in node) {
      var fontName = node.fontName;
      if (fontName === figma.mixed) {
        styles.push("Font: Mixed");
      } else if (fontName) {
        var font = fontName;
        styles.push("Font: " + font.family + " " + (font.style || "Regular"));
      }
    }
  } catch (e) {
    console.log("[extractStyles] Error accessing fontName:", e);
  }

  try {
    // Check corner radius
    if ("cornerRadius" in node && node.cornerRadius !== undefined) {
      var radius = node.cornerRadius;
      if (radius === figma.mixed) {
        styles.push("Corner Radius: Mixed");
      } else if (typeof radius === "number" && radius > 0) {
        styles.push("Corner Radius: " + radius + "px");
      }
    }
  } catch (e) {
    console.log("[extractStyles] Error accessing cornerRadius:", e);
  }

  console.log("[extractStyles] Extracted styles:", styles);
  return styles;
}

function extractLinks(node) {
  var links = [];
  console.log("[extractLinks] Starting extraction for node:", node.name);

  try {
    // Check Figma's native documentationLinks property (PRIORITY)
    if ("documentationLinks" in node && Array.isArray(node.documentationLinks)) {
      console.log("[extractLinks] Found documentationLinks array, length:", node.documentationLinks.length);
      for (var i = 0; i < node.documentationLinks.length; i += 1) {
        var docLink = node.documentationLinks[i];
        if (docLink && typeof docLink === "object" && "uri" in docLink) {
          var uri = docLink.uri.trim();
          if (uri && (uri.startsWith("http://") || uri.startsWith("https://"))) {
            console.log("[extractLinks] Found documentation link:", uri);
            // Check for duplicates before adding
            if (links.indexOf(uri) === -1) {
              links.push(uri);
            }
          }
        } else if (typeof docLink === "string") {
          var trimmedLink = docLink.trim();
          if (trimmedLink && (trimmedLink.startsWith("http://") || trimmedLink.startsWith("https://"))) {
            console.log("[extractLinks] Found documentation link (string):", trimmedLink);
            if (links.indexOf(trimmedLink) === -1) {
              links.push(trimmedLink);
            }
          }
        }
      }
    }
  } catch (e) {
    console.log("[extractLinks] Error checking documentationLinks:", e);
  }

  try {
    // Check description field for URLs
    if ("description" in node && typeof node.description === "string") {
      var description = node.description;
      console.log("[extractLinks] Checking description:", description);
      // Extract URLs from description using regex
      var urlRegex = /(https?:\/\/[^\s]+)/g;
      var matches = description.match(urlRegex);
      if (matches) {
        for (var i = 0; i < matches.length; i += 1) {
          var url = matches[i].trim();
          console.log("[extractLinks] Found URL in description:", url);
          // Check for duplicates before adding
          if (links.indexOf(url) === -1) {
            links.push(url);
          }
        }
      }
    }
  } catch (e) {
    console.log("[extractLinks] Error checking description:", e);
  }

  try {
    // Check plugin data
    if ("getPluginData" in node) {
      var linkKeys = [
        "documentation",
        "documentationUrl",
        "docUrl",
        "docs",
        "url",
        "link",
        "hyperlink",
        "doc",
        "reference",
        "ref"
      ];

      for (var i = 0; i < linkKeys.length; i += 1) {
        var key = linkKeys[i];
        try {
          var value = node.getPluginData(key);
          if (typeof value === "string") {
            var trimmed = value.trim();
            if (trimmed) {
              console.log("[extractLinks] Found link in plugin data key '" + key + "':", trimmed);
              // Check for duplicates before adding
              if (links.indexOf(trimmed) === -1) {
                links.push(trimmed);
              }
            }
          }
        } catch (e) {
          // Skip if key doesn't exist
        }
      }
    }
  } catch (e) {
    console.log("[extractLinks] Error checking plugin data:", e);
  }

  try {
    // Check hyperlinks property
    if ("hyperlinks" in node) {
      console.log("[extractLinks] Checking hyperlinks property");
      var hyperlinks = node.hyperlinks;
      if (hyperlinks && typeof hyperlinks === "object") {
        var hyperlinkKeys = Object.keys(hyperlinks);
        console.log("[extractLinks] Hyperlink keys found:", hyperlinkKeys.length);
        for (var i = 0; i < hyperlinkKeys.length; i += 1) {
          var hyperlink = hyperlinks[hyperlinkKeys[i]];
          if (typeof hyperlink === "string" && hyperlink.trim()) {
            var trimmedHyperlink = hyperlink.trim();
            console.log("[extractLinks] Found hyperlink:", trimmedHyperlink);
            // Check for duplicates before adding
            if (links.indexOf(trimmedHyperlink) === -1) {
              links.push(trimmedHyperlink);
            }
          }
        }
      }
    } else {
      console.log("[extractLinks] No hyperlinks property");
    }
  } catch (e) {
    console.log("[extractLinks] Error checking hyperlinks:", e);
  }

  try {
    // Check component properties (for component instances)
    if ("componentProperties" in node && node.componentProperties) {
      console.log("[extractLinks] Checking component properties");
      var props = node.componentProperties;
      var propKeys = Object.keys(props);
      for (var i = 0; i < propKeys.length; i += 1) {
        var propKey = propKeys[i];
        var prop = props[propKey];
        if (prop && prop.type === "TEXT" && typeof prop.value === "string") {
          var propValue = prop.value.trim();
          if (propValue && (propValue.startsWith("http://") || propValue.startsWith("https://"))) {
            console.log("[extractLinks] Found link in component property '" + propKey + "':", propValue);
            // Check for duplicates before adding
            if (links.indexOf(propValue) === -1) {
              links.push(propValue);
            }
          }
        }
      }
    }
  } catch (e) {
    console.log("[extractLinks] Error checking component properties:", e);
  }

  console.log("[extractLinks] Extracted links:", links);
  return links;
}

function extractMetadata(node, mainComponent, selectedModes) {
  console.log("[extractMetadata] Starting extraction for node:", node.name, node.type);
  console.log("[extractMetadata] Node ID:", node.id);
  console.log("[extractMetadata] Selected modes for variable resolution:", selectedModes);
  console.log("[extractMetadata] Node has description:", "description" in node);
  if ("description" in node) {
    console.log("[extractMetadata] Node description:", node.description);
  }
  
  if (mainComponent) {
    console.log("[extractMetadata] Also checking main component:", mainComponent.name);
    console.log("[extractMetadata] Main component ID:", mainComponent.id);
    console.log("[extractMetadata] Main component has description:", "description" in mainComponent);
    if ("description" in mainComponent) {
      console.log("[extractMetadata] Main component description:", mainComponent.description);
    }
  }
  
  var metadata = {
    name: node.name || "Unnamed",
    type: node.type || "Unknown",
    description: "",
    codeConnect: false,
    tokens: [],
    styles: [],
    links: [],
    collections: [], // Variable collections and modes
    // Organized variable categories
    colorVariables: [],
    typographyVariables: [],
    spacingVariables: [],
    cornerRadiusVariables: []
  };

  // Extract description from node or main component
  try {
    if ("description" in node && typeof node.description === "string" && node.description.trim()) {
      metadata.description = node.description.trim();
      console.log("[extractMetadata] Found description on node:", metadata.description);
    } else if (mainComponent && "description" in mainComponent && typeof mainComponent.description === "string" && mainComponent.description.trim()) {
      metadata.description = mainComponent.description.trim();
      console.log("[extractMetadata] Found description on main component:", metadata.description);
    }
  } catch (e) {
    console.log("[extractMetadata] Error extracting description:", e);
  }

  // Check for Code Connect
  try {
    var nodeToCheck = mainComponent || node;
    if ("devResources" in nodeToCheck && Array.isArray(nodeToCheck.devResources) && nodeToCheck.devResources.length > 0) {
      metadata.codeConnect = true;
      console.log("[extractMetadata] Code Connect found on component");
    } else {
      console.log("[extractMetadata] No Code Connect found");
    }
  } catch (e) {
    console.log("[extractMetadata] Error checking Code Connect:", e);
  }

  // Extract variable collections and modes from bound variables
  // This includes both local AND library (remote) variables
  try {
    console.log("[extractMetadata] Extracting collections from bound variables...");
    var collectionMap = {}; // Use map to avoid duplicates
    
    // Helper function to process bound variables and extract their collections
    function extractCollectionsFromBoundVariables(boundVars) {
      if (!boundVars || typeof boundVars !== 'object') return;
      
      for (var prop in boundVars) {
        if (boundVars.hasOwnProperty(prop)) {
          var binding = boundVars[prop];
          
          // Handle direct variable binding
          if (binding && binding.id) {
            try {
              var variable = figma.variables.getVariableById(binding.id);
              if (variable && variable.variableCollectionId) {
                var collectionId = variable.variableCollectionId;
                
                // Skip if we already have this collection
                if (!collectionMap[collectionId]) {
                  try {
                    var collection = figma.variables.getVariableCollectionById(collectionId);
                    if (collection) {
                      console.log("[extractMetadata] Found collection:", collection.name, "from variable:", variable.name);
                      collectionMap[collectionId] = collection;
                    }
                  } catch (e) {
                    console.log("[extractMetadata] Could not get collection for ID:", collectionId, e);
                  }
                }
              }
            } catch (e) {
              console.log("[extractMetadata] Could not get variable for ID:", binding.id, e);
            }
          }
          
          // Handle nested bindings (componentProperties, etc.)
          if (binding && typeof binding === 'object' && !binding.id) {
            extractCollectionsFromBoundVariables(binding);
          }
        }
      }
    }
    
    // Check boundVariables on the node
    if ("boundVariables" in node && node.boundVariables) {
      console.log("[extractMetadata] Node has boundVariables property");
      extractCollectionsFromBoundVariables(node.boundVariables);
    }
    
    // Also check children for bound variables
    if ("children" in node && Array.isArray(node.children)) {
      for (var i = 0; i < node.children.length; i += 1) {
        var child = node.children[i];
        if ("boundVariables" in child && child.boundVariables) {
          extractCollectionsFromBoundVariables(child.boundVariables);
        }
      }
    }
    
    // Convert collection map to array and extract modes
    console.log("[extractMetadata] Found", Object.keys(collectionMap).length, "unique collections");
    for (var collectionId in collectionMap) {
      if (collectionMap.hasOwnProperty(collectionId)) {
        var collection = collectionMap[collectionId];
        console.log("[extractMetadata] Processing collection:", collection.name);
        console.log("[extractMetadata] Collection ID:", collection.id);
        console.log("[extractMetadata] Collection modes:", collection.modes);
        console.log("[extractMetadata] Collection remote:", collection.remote);
        
        var collectionData = {
          id: collection.id,
          name: collection.name,
          remote: collection.remote || false,
          modes: []
        };
        
        // Extract modes from the collection
        if (collection.modes && Array.isArray(collection.modes)) {
          console.log("[extractMetadata] Collection has", collection.modes.length, "modes");
          for (var j = 0; j < collection.modes.length; j += 1) {
            var mode = collection.modes[j];
            console.log("[extractMetadata] Mode", j, ":", mode.name, "ID:", mode.modeId);
            collectionData.modes.push({
              modeId: mode.modeId,
              name: mode.name
            });
          }
        } else {
          console.log("[extractMetadata] Collection has no modes array");
        }
        
        metadata.collections.push(collectionData);
        console.log("[extractMetadata] Added collection:", collection.name, "with", collectionData.modes.length, "modes");
      }
    }
    
    console.log("[extractMetadata] Final collections array length:", metadata.collections.length);
    console.log("[extractMetadata] Final collections data:", JSON.stringify(metadata.collections));
  } catch (e) {
    console.log("[extractMetadata] Error extracting collections:", e);
    console.log("[extractMetadata] Error stack:", e.stack);
  }

  try {
    metadata.styles = extractStyles(node);
    console.log("[extractMetadata] Extracted styles from node:", metadata.styles);
    
    // Also check children if the node is a container
    if ("children" in node && node.children && node.children.length > 0) {
      console.log("[extractMetadata] Node has children, checking them too. Count:", node.children.length);
      for (var childIdx = 0; childIdx < node.children.length; childIdx += 1) {
        var child = node.children[childIdx];
        console.log("[extractMetadata] Checking child:", child.name, child.type);
        var childStyles = extractStyles(child);
        if (childStyles.length > 0) {
          console.log("[extractMetadata] Found styles in child:", childStyles);
          // Merge unique styles
          for (var s = 0; s < childStyles.length; s += 1) {
            if (metadata.styles.indexOf(childStyles[s]) === -1) {
              metadata.styles.push(childStyles[s]);
            }
          }
        }
      }
    }
    
    // Also store RGB values for variable matching
    metadata._rawColors = [];
    if ("fills" in node && node.fills !== figma.mixed && Array.isArray(node.fills)) {
      for (var i = 0; i < node.fills.length; i += 1) {
        var fill = node.fills[i];
        if (fill && fill.visible !== false && fill.type === "SOLID" && fill.color) {
          metadata._rawColors.push({
            r: fill.color.r,
            g: fill.color.g,
            b: fill.color.b,
            opacity: fill.opacity !== undefined ? fill.opacity : 1
          });
        }
      }
    }
  } catch (e) {
    console.log("[extractMetadata] Error extracting styles:", e);
  }

  try {
    // Extract links from both the instance and main component
    metadata.links = extractLinks(node);
    if (mainComponent && mainComponent !== node) {
      var mainComponentLinks = extractLinks(mainComponent);
      // Merge links, avoiding duplicates
      for (var i = 0; i < mainComponentLinks.length; i += 1) {
        if (metadata.links.indexOf(mainComponentLinks[i]) === -1) {
          metadata.links.push(mainComponentLinks[i]);
        }
      }
    }
    console.log("[extractMetadata] Extracted links:", metadata.links);
  } catch (e) {
    console.log("[extractMetadata] Error extracting links:", e);
  }

  try {
    // Extract tokens from multiple sources
    var tokens = [];
    
    // 1. Check plugin data
    if ("getPluginData" in node) {
      var tokenKeys = [
        "token",
        "tokens",
        "designToken",
        "designTokens",
        "design-token",
        "design-tokens",
        "variable",
        "variables",
        "var",
        "vars"
      ];

      for (var i = 0; i < tokenKeys.length; i += 1) {
        var key = tokenKeys[i];
        try {
          var value = node.getPluginData(key);
          if (typeof value === "string") {
            var trimmed = value.trim();
            if (trimmed) {
              console.log("[extractMetadata] Found token in plugin data key '" + key + "':", trimmed);
              // If it's JSON, try to parse it
              if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
                try {
                  var parsed = JSON.parse(trimmed);
                  if (Array.isArray(parsed)) {
                    for (var j = 0; j < parsed.length; j += 1) {
                      if (typeof parsed[j] === "string") {
                        tokens.push(parsed[j]);
                      }
                    }
                  } else if (typeof parsed === "object") {
                    var parsedKeys = Object.keys(parsed);
                    for (var j = 0; j < parsedKeys.length; j += 1) {
                      tokens.push(parsedKeys[j] + ": " + String(parsed[parsedKeys[j]]));
                    }
                  }
                } catch (parseError) {
                  // If parsing fails, just add the raw string
                  tokens.push(trimmed);
                }
              } else {
                // Check if it's comma-separated
                if (trimmed.indexOf(",") > -1) {
                  var parts = trimmed.split(",");
                  for (var j = 0; j < parts.length; j += 1) {
                    var part = parts[j].trim();
                    if (part) {
                      tokens.push(part);
                    }
                  }
                } else {
                  tokens.push(trimmed);
                }
              }
            }
          }
        } catch (e) {
          // Skip if key doesn't exist
        }
      }
    }

    // 2. Check component properties for tokens
    try {
      if ("componentProperties" in node && node.componentProperties) {
        console.log("[extractMetadata] Checking component properties for tokens");
        var props = node.componentProperties;
        var propKeys = Object.keys(props);
        for (var i = 0; i < propKeys.length; i += 1) {
          var propKey = propKeys[i];
          var prop = props[propKey];
          // Check if property name or value suggests it's a token
          if (propKey.toLowerCase().indexOf("token") > -1 || 
              propKey.toLowerCase().indexOf("variable") > -1 ||
              propKey.toLowerCase().indexOf("design") > -1) {
            if (prop && prop.type === "TEXT" && typeof prop.value === "string") {
              var propValue = prop.value.trim();
              if (propValue) {
                console.log("[extractMetadata] Found token in component property '" + propKey + "':", propValue);
                tokens.push(propKey + ": " + propValue);
              }
            }
          }
        }
      }
    } catch (e) {
      console.log("[extractMetadata] Error checking component properties for tokens:", e);
    }

    // 3. Check if node has bound variables (Figma Variables)
    try {
      console.log("[extractMetadata] Checking for Figma Variables...");
      console.log("[extractMetadata] Node has boundVariables property:", "boundVariables" in node);
      
      // Check both the instance and main component for boundVariables
      var nodesToCheck = [node];
      if (mainComponent && mainComponent !== node) {
        console.log("[extractMetadata] Also checking main component for boundVariables");
        nodesToCheck.push(mainComponent);
      }
      
      // Also check children nodes for boundVariables
      if ("children" in node && node.children && node.children.length > 0) {
        console.log("[extractMetadata] Adding children to boundVariables check. Count:", node.children.length);
        for (var childIdx = 0; childIdx < node.children.length; childIdx += 1) {
          nodesToCheck.push(node.children[childIdx]);
        }
      }
      if (mainComponent && "children" in mainComponent && mainComponent.children && mainComponent.children.length > 0) {
        console.log("[extractMetadata] Adding main component children to boundVariables check. Count:", mainComponent.children.length);
        for (var childIdx = 0; childIdx < mainComponent.children.length; childIdx += 1) {
          nodesToCheck.push(mainComponent.children[childIdx]);
        }
      }
      
      var foundVariables = false;
      for (var nodeIdx = 0; nodeIdx < nodesToCheck.length; nodeIdx += 1) {
        var checkNode = nodesToCheck[nodeIdx];
        var nodeLabel = "node " + nodeIdx + " (" + checkNode.name + " - " + checkNode.type + ")";
        console.log("[extractMetadata] Checking", nodeLabel, "for boundVariables");
        
        // Check node.boundVariables (this is where variables are stored!)
        if ("boundVariables" in checkNode && checkNode.boundVariables) {
          foundVariables = true;
          console.log("[extractMetadata]", nodeLabel, "has boundVariables:", checkNode.boundVariables);
          var boundVars = checkNode.boundVariables;
          var boundKeys = Object.keys(boundVars);
          console.log("[extractMetadata] Bound variable properties on", nodeLabel, ":", boundKeys);
        
        // Process each bound variable synchronously
        for (var i = 0; i < boundKeys.length; i += 1) {
          var propertyName = boundKeys[i];
          var variableRef = boundVars[propertyName];
          console.log("[extractMetadata] Property", propertyName, "bound to variable ref:", variableRef);
          
          // Handle both direct ID and VariableAlias object with id property
          var variableId = null;
          if (typeof variableRef === "string") {
            variableId = variableRef;
          } else if (variableRef && typeof variableRef === "object" && "id" in variableRef) {
            variableId = variableRef.id;
          } else if (Array.isArray(variableRef) && variableRef.length > 0 && variableRef[0].id) {
            // Handle array of variable references
            variableId = variableRef[0].id;
          }
          
          if (!variableId) {
            console.log("[extractMetadata] Could not extract variable ID from:", variableRef);
            continue;
          }
          
          console.log("[extractMetadata] Extracted variable ID:", variableId);
          
          // Format property name for display
          var displayName = propertyName;
          if (propertyName.indexOf("/") > -1) {
            // Handle property paths like "fills/0/color"
            var parts = propertyName.split("/");
            if (parts[0] === "fills") {
              displayName = "Fill";
              if (parts.length > 2 && parts[2] === "color") {
                displayName = "Fill Color";
              } else if (parts.length > 2 && parts[2] === "opacity") {
                displayName = "Fill Opacity";
              }
            } else if (parts[0] === "strokes") {
              displayName = "Stroke";
              if (parts.length > 2 && parts[2] === "color") {
                displayName = "Stroke Color";
              }
            } else if (parts[0] === "strokeWeight") {
              displayName = "Stroke Weight";
            } else if (parts[0] === "opacity") {
              displayName = "Opacity";
            } else if (parts[0] === "cornerRadius" || parts[0] === "topLeftRadius" || 
                       parts[0] === "topRightRadius" || parts[0] === "bottomLeftRadius" || 
                       parts[0] === "bottomRightRadius") {
              displayName = "Corner Radius";
            } else if (parts[0] === "paddingLeft" || parts[0] === "paddingRight" || 
                       parts[0] === "paddingTop" || parts[0] === "paddingBottom") {
              displayName = parts[0].replace("padding", "Padding ");
            }
          } else {
            // Simple property names
            if (propertyName === "fills") {
              displayName = "Fill";
            } else if (propertyName === "strokes") {
              displayName = "Stroke";
            } else if (propertyName === "strokeWeight") {
              displayName = "Stroke Weight";
            } else if (propertyName === "opacity") {
              displayName = "Opacity";
            } else if (propertyName === "cornerRadius" || propertyName === "topLeftRadius" || 
                       propertyName === "topRightRadius" || propertyName === "bottomLeftRadius" || 
                       propertyName === "bottomRightRadius") {
              displayName = "Corner Radius";
            } else if (propertyName === "paddingLeft") {
              displayName = "Padding Left";
            } else if (propertyName === "paddingRight") {
              displayName = "Padding Right";
            } else if (propertyName === "paddingTop") {
              displayName = "Padding Top";
            } else if (propertyName === "paddingBottom") {
              displayName = "Padding Bottom";
            }
          }
          
          // Try to get variable synchronously first (if available)
          try {
            // Try sync method first
            var variable = null;
            try {
              variable = figma.variables.getVariableById(variableId);
            } catch (syncError) {
              console.log("[extractMetadata] Sync method failed, trying async for", variableId);
              // If sync fails, use async but we'll need to handle it differently
              // Capture propertyName and displayName in closure
              (function(propName, dispName, varId) {
                figma.variables.getVariableByIdAsync(varId).then(function(v) {
                  if (v) {
                    console.log("[extractMetadata] Async resolved variable:", v.name, v.key);
                    // Note: This will update tokens after metadata is returned, but that's okay
                    // We'll send an update message
                    figma.ui.postMessage({
                      type: "variable-resolved",
                      property: propName,
                      displayName: dispName,
                      variableName: v.name,
                      variableKey: v.key
                    });
                  }
                }).catch(function(err) {
                  console.log("[extractMetadata] Error resolving variable async:", err);
                });
              })(propertyName, displayName, variableId);
            }
            
            if (variable) {
              console.log("[extractMetadata] Resolved variable:", variable.name, variable.key, "Type:", variable.resolvedType);
              
              // Get the actual value based on type
              var variableValue = "";
              var variableCategory = "other";
              
              try {
                var valuesByMode = variable.valuesByMode;
                var modeKeys = Object.keys(valuesByMode);
                
                // Determine which mode to use for this variable
                var modeIdToUse = modeKeys[0]; // Default to first mode
                console.log("[extractMetadata] Variable:", variable.name, "Collection ID:", variable.variableCollectionId);
                console.log("[extractMetadata] Available modes for this variable:", modeKeys);
                console.log("[extractMetadata] selectedModes object:", selectedModes);
                
                if (selectedModes && variable.variableCollectionId) {
                  var collectionId = variable.variableCollectionId;
                  if (selectedModes[collectionId]) {
                    modeIdToUse = selectedModes[collectionId];
                    console.log("[extractMetadata] ✓ Using selected mode", modeIdToUse, "for variable", variable.name);
                  } else {
                    console.log("[extractMetadata] ✗ No selected mode for collection", collectionId, ", using first mode:", modeIdToUse);
                  }
                } else {
                  console.log("[extractMetadata] ✗ No selectedModes provided, using first mode:", modeIdToUse);
                }
                
                if (modeKeys.length > 0) {
                  var value = valuesByMode[modeIdToUse];
                  console.log("[extractMetadata] Resolved value for mode", modeIdToUse, ":", value);
                  
                  if (variable.resolvedType === "COLOR") {
                    variableCategory = "color";
                    if (value && typeof value === "object" && "r" in value) {
                      var r = Math.round(value.r * 255);
                      var g = Math.round(value.g * 255);
                      var b = Math.round(value.b * 255);
                      variableValue = "#" + 
                        ("0" + r.toString(16)).slice(-2) + 
                        ("0" + g.toString(16)).slice(-2) + 
                        ("0" + b.toString(16)).slice(-2);
                      variableValue = variableValue.toUpperCase();
                    }
                  } else if (variable.resolvedType === "FLOAT") {
                    // Could be spacing, corner radius, or other numeric value
                    if (typeof value === "number") {
                      variableValue = value + "px";
                      
                      // Determine category based on property name
                      var lowerProp = propertyName.toLowerCase();
                      var lowerDisplay = displayName.toLowerCase();
                      var lowerVarName = variable.name.toLowerCase();
                      
                      if (lowerProp.indexOf("padding") > -1 || lowerProp.indexOf("margin") > -1 || 
                          lowerDisplay.indexOf("padding") > -1 || lowerDisplay.indexOf("spacing") > -1 ||
                          lowerVarName.indexOf("spacing") > -1 || lowerVarName.indexOf("padding") > -1) {
                        variableCategory = "spacing";
                      } else if (lowerProp.indexOf("radius") > -1 || lowerDisplay.indexOf("radius") > -1 ||
                                 lowerVarName.indexOf("radius") > -1) {
                        variableCategory = "cornerRadius";
                      } else if (lowerProp.indexOf("size") > -1 || lowerProp.indexOf("font") > -1 ||
                                 lowerDisplay.indexOf("font") > -1 || lowerDisplay.indexOf("text") > -1) {
                        variableCategory = "typography";
                      }
                    }
                  } else if (variable.resolvedType === "STRING") {
                    variableValue = value;
                    if (propertyName.indexOf("font") > -1 || displayName.indexOf("Font") > -1) {
                      variableCategory = "typography";
                    }
                  }
                }
              } catch (valueError) {
                console.log("[extractMetadata] Error getting variable value:", valueError);
              }
              
              // Create variable object
              var varObj = {
                property: displayName,
                name: variable.name,
                value: variableValue
              };
              
              // Add to appropriate category
              if (variableCategory === "color") {
                metadata.colorVariables.push(varObj);
              } else if (variableCategory === "typography") {
                metadata.typographyVariables.push(varObj);
              } else if (variableCategory === "spacing") {
                metadata.spacingVariables.push(varObj);
              } else if (variableCategory === "cornerRadius") {
                metadata.cornerRadiusVariables.push(varObj);
              }
              
              // Also keep in tokens for backward compatibility
              var tokenString = displayName + " Variable: " + variable.name;
              if (variableValue) {
                tokenString += " (" + variableValue + ")";
              }
              
              if (tokens.indexOf(tokenString) === -1) {
                tokens.push(tokenString);
              }
            } else {
              // Store variable ID for now (only if not duplicate)
              var tokenString = displayName + " Variable ID: " + variableId;
              if (tokens.indexOf(tokenString) === -1) {
                tokens.push(tokenString);
              }
            }
          } catch (e) {
            console.log("[extractMetadata] Error processing variable", variableId, ":", e);
            tokens.push(displayName + " Variable ID: " + variableId);
          }
        }
        }
      }
      
      if (!foundVariables) {
        console.log("[extractMetadata] Neither instance nor main component has boundVariables property");
        
        // Fallback: Check if fill color matches any variable value
        try {
          var localVariables = figma.variables.getLocalVariables();
          console.log("[extractMetadata] Found", localVariables.length, "local variables for fallback matching");
          
          // Check fills on both instance and main component and children
          var nodesToCheckFills = [node];
          if (mainComponent && mainComponent !== node) {
            nodesToCheckFills.push(mainComponent);
          }
          // Add children
          if ("children" in node && node.children) {
            for (var cIdx = 0; cIdx < node.children.length; cIdx += 1) {
              nodesToCheckFills.push(node.children[cIdx]);
            }
          }
          if (mainComponent && "children" in mainComponent && mainComponent.children) {
            for (var cIdx = 0; cIdx < mainComponent.children.length; cIdx += 1) {
              nodesToCheckFills.push(mainComponent.children[cIdx]);
            }
          }
          
          for (var fillNodeIdx = 0; fillNodeIdx < nodesToCheckFills.length; fillNodeIdx += 1) {
            var fillNode = nodesToCheckFills[fillNodeIdx];
            var fillNodeLabel = "node " + fillNodeIdx + " (" + fillNode.name + " - " + fillNode.type + ")";
            console.log("[extractMetadata] Checking fills on", fillNodeLabel);
            
            if ("fills" in fillNode) {
              var fills = fillNode.fills;
              if (fills !== figma.mixed && Array.isArray(fills)) {
                for (var i = 0; i < fills.length; i += 1) {
                  var fill = fills[i];
                  if (fill && fill.visible !== false && fill.type === "SOLID" && fill.color) {
                    var fillR = Math.round(fill.color.r * 255);
                    var fillG = Math.round(fill.color.g * 255);
                    var fillB = Math.round(fill.color.b * 255);
                    var fillOpacity = fill.opacity !== undefined ? fill.opacity : 1;
                    
                    console.log("[extractMetadata] Checking fill color RGB on", fillNodeLabel, ":", fillR, fillG, fillB, "against variables");
                  
                  for (var v = 0; v < localVariables.length; v += 1) {
                    var variable = localVariables[v];
                    try {
                      if (variable.resolvedType === "COLOR") {
                        var varValue = variable.valuesByMode;
                        var modeKeys = Object.keys(varValue);
                        
                        // Prioritize selected mode for this variable's collection
                        var modeToCheck = modeKeys[0]; // Default
                        if (selectedModes && variable.variableCollectionId && selectedModes[variable.variableCollectionId]) {
                          modeToCheck = selectedModes[variable.variableCollectionId];
                        }
                        
                        // Only check the appropriate mode (selected or first)
                        var modeValue = varValue[modeToCheck];
                          if (modeValue && typeof modeValue === "object" && "r" in modeValue) {
                            var varR = Math.round(modeValue.r * 255);
                            var varG = Math.round(modeValue.g * 255);
                            var varB = Math.round(modeValue.b * 255);
                            var varOpacity = modeValue.a !== undefined ? modeValue.a : 1;
                            
                            if (Math.abs(fillR - varR) <= 1 && 
                                Math.abs(fillG - varG) <= 1 && 
                                Math.abs(fillB - varB) <= 1 &&
                                Math.abs(fillOpacity - varOpacity) < 0.01) {
                              console.log("[extractMetadata] MATCH! Fill matches variable:", variable.name);
                              
                              // Convert to hex
                              var hexColor = "#" + 
                                ("0" + varR.toString(16)).slice(-2) + 
                                ("0" + varG.toString(16)).slice(-2) + 
                                ("0" + varB.toString(16)).slice(-2);
                              hexColor = hexColor.toUpperCase();
                              
                              var tokenString = "Fill Variable: " + variable.name + " (" + hexColor + ")";
                              // Check for duplicates before adding
                              if (tokens.indexOf(tokenString) === -1) {
                                tokens.push(tokenString);
                              }
                              
                              // Also add to colorVariables
                              var varObj = {
                                property: "Fill",
                                name: variable.name,
                                value: hexColor
                              };
                              // Check for duplicate in colorVariables
                              var isDupe = false;
                              for (var cv = 0; cv < metadata.colorVariables.length; cv += 1) {
                                if (metadata.colorVariables[cv].name === variable.name) {
                                  isDupe = true;
                                  break;
                                }
                              }
                              if (!isDupe) {
                                metadata.colorVariables.push(varObj);
                              }
                            }
                          }
                      }
                    } catch (varCheckError) {
                      console.log("[extractMetadata] Error checking variable", variable.name, ":", varCheckError);
                    }
                  }
                  }
                }
              }
            }
          }
        } catch (fallbackError) {
          console.log("[extractMetadata] Error in fallback variable matching:", fallbackError);
        }
      }
    } catch (e) {
      console.log("[extractMetadata] Error checking variables:", e);
      console.log("[extractMetadata] Error stack:", e.stack);
    }

    metadata.tokens = tokens;
    console.log("[extractMetadata] Extracted tokens:", metadata.tokens);
  } catch (e) {
    console.log("[extractMetadata] Error extracting tokens:", e);
  }

  // Sort color variables to ensure Fill comes before Stroke
  if (metadata.colorVariables && metadata.colorVariables.length > 0) {
    metadata.colorVariables.sort(function(a, b) {
      // Define priority order
      var order = { "Fill": 1, "Fill Color": 1, "Fill Opacity": 2, "Stroke": 3, "Stroke Color": 3, "Stroke Weight": 4 };
      var aPriority = order[a.property] || 999;
      var bPriority = order[b.property] || 999;
      return aPriority - bPriority;
    });
    console.log("[extractMetadata] Sorted color variables:", metadata.colorVariables);
  }

  console.log("[extractMetadata] ===== EXTRACTION SUMMARY =====");
  console.log("[extractMetadata] Name:", metadata.name);
  console.log("[extractMetadata] Type:", metadata.type);
  console.log("[extractMetadata] Tokens found:", metadata.tokens.length);
  console.log("[extractMetadata] Styles found:", metadata.styles.length);
  console.log("[extractMetadata] Links found:", metadata.links.length);
  console.log("[extractMetadata] Tokens:", JSON.stringify(metadata.tokens));
  console.log("[extractMetadata] Styles:", JSON.stringify(metadata.styles));
  console.log("[extractMetadata] Links:", JSON.stringify(metadata.links));
  console.log("[extractMetadata] ================================");
  console.log("[extractMetadata] Final metadata:", JSON.stringify(metadata, null, 2));
  return metadata;
}

function notifyDocumentation(reason, url, metadata) {
  if (reason === undefined || reason === null) {
    reason = "missing";
  }

  var message = {
    type: "documentation-link",
    url: url !== undefined && url !== null ? url : null,
    reason: reason,
    metadata: metadata || null
  };

  console.log("[notifyDocumentation] Posting message:", JSON.stringify(message, null, 2));
  figma.ui.postMessage(message);
}

function resolveDocumentationFromSelection(selectedModes) {
  console.log("[resolveDocumentationFromSelection] Starting resolution");
  console.log("[resolveDocumentationFromSelection] Selected modes:", selectedModes);
  var selection = figma.currentPage.selection[0];

  if (!selection) {
    console.log("[resolveDocumentationFromSelection] No selection found");
    notifyDocumentation("no-selection", null, null);
    return;
  }

  console.log("[resolveDocumentationFromSelection] Selection found:", selection.name, selection.type);
  var node = selection;
  var isInstance = false;

  if ("mainComponent" in selection && selection.mainComponent) {
    node = selection.mainComponent;
    isInstance = true;
    console.log("[resolveDocumentationFromSelection] Instance detected, main component:", node.name);
  }

  var metadata = null;
  try {
    // Pass main component and selected modes to extractMetadata
    var mainComp = isInstance && node ? node : null;
    metadata = extractMetadata(selection, mainComp, selectedModes);
    if (isInstance && node) {
      metadata.componentName = node.name;
    }
  } catch (e) {
    console.log("[resolveDocumentationFromSelection] Error extracting metadata:", e);
    metadata = {
      name: selection.name || "Unnamed",
      type: selection.type || "Unknown",
      tokens: [],
      styles: [],
      links: []
    };
  }

  var docUrl = null;
  try {
    if ("getPluginData" in node) {
      var keys = [
        "documentation",
        "documentationUrl",
        "docUrl",
        "docs",
        "url"
      ];

      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        var value = node.getPluginData(key);
        if (typeof value === "string") {
          var trimmed = value.trim();
          if (trimmed) {
            docUrl = trimmed;
            console.log("[resolveDocumentationFromSelection] Found doc URL:", docUrl);
            break;
          }
        }
      }
    }
  } catch (e) {
    console.log("[resolveDocumentationFromSelection] Error checking plugin data:", e);
  }

  console.log("[resolveDocumentationFromSelection] Sending notification with metadata:", metadata !== null);
  if (docUrl) {
    notifyDocumentation("success", docUrl, metadata);
  } else {
    notifyDocumentation("missing", null, metadata);
  }
}

figma.ui.onmessage = function (message) {
  console.log("[figma.ui.onmessage] Message received from UI:", message);
  if (!message) {
    console.log("[figma.ui.onmessage] Message is null/undefined");
    return;
  }

  console.log("[figma.ui.onmessage] Message type:", message.type);
  if (message.type === "request-documentation") {
    console.log("[figma.ui.onmessage] ===== HANDLING REQUEST-DOCUMENTATION =====");
    var selectedModes = message.selectedModes || {};
    console.log("[figma.ui.onmessage] Selected modes received:", JSON.stringify(selectedModes));
    console.log("[figma.ui.onmessage] Number of collections in selectedModes:", Object.keys(selectedModes).length);
    resolveDocumentationFromSelection(selectedModes);
  } else if (message.type === "scan-components") {
    console.log("[figma.ui.onmessage] Handling scan-components");
    scanFileForComponents();
  } else {
    console.log("[figma.ui.onmessage] Unknown message type:", message.type);
  }
};

figma.on("selectionchange", function () {
  try {
    console.log("[selectionchange] Selection changed event fired");
    var currentSelection = figma.currentPage.selection;
    console.log("[selectionchange] Current selection:", currentSelection);
    if (!currentSelection || currentSelection.length === 0) {
      console.log("[selectionchange] No selection");
      notifyDocumentation("no-selection", null, null);
    } else {
      console.log("[selectionchange] Selection count:", currentSelection.length);
      console.log("[selectionchange] First item:", currentSelection[0].name, currentSelection[0].type);
      resolveDocumentationFromSelection();
    }
  } catch (error) {
    console.log("[selectionchange] ERROR:", error);
    console.log("[selectionchange] Error stack:", error.stack);
  }
});

function hasDocumentation(node) {
  try {
    return (
      "documentationLinks" in node &&
      Array.isArray(node.documentationLinks) &&
      node.documentationLinks.length > 0
    );
  } catch (e) {
    return false;
  }
}

function hasCodeConnect(node) {
  try {
    return (
      "devResources" in node &&
      Array.isArray(node.devResources) &&
      node.devResources.length > 0
    );
  } catch (e) {
    return false;
  }
}

function scanFileForComponents() {
  console.log("[scanFileForComponents] Starting file scan");
  
  var componentSetIds = {};
  var standaloneComponentIds = {};
  var totalInstanceCount = 0;
  var detachmentCount = 0;
  var instancesData = [];
  var detachedNodes = [];
  var componentNameMap = {}; // Map of component names defined in this file
  var componentUsageMap = {}; // Map of component names actually used via instances
  var suspiciousFrames = []; // Frames/groups that might be detached instances
  var trackedComponents = {}; // Map of component metadata for stats
  
  function recordComponentInfo(componentNode) {
    if (!componentNode || !componentNode.id) {
      return;
    }
    if (trackedComponents[componentNode.id]) {
      return;
    }
    trackedComponents[componentNode.id] = {
      name: componentNode.name || "Unnamed Component",
      hasDocs: hasDocumentation(componentNode),
      hasCode: hasCodeConnect(componentNode)
    };
  }
  
  function traverseNode(node, parentType, isInsideInstance) {
    // Count COMPONENT_SET as one unique component (variant group)
    if (node.type === "COMPONENT_SET") {
      componentSetIds[node.id] = {
        id: node.id,
        name: node.name
      };
      componentNameMap[node.name] = node.id;
      console.log("[scanFileForComponents] Found component set (variants):", node.name);
    }
    
    // Count standalone COMPONENT nodes (but not those inside COMPONENT_SET)
    if (node.type === "COMPONENT" && parentType !== "COMPONENT_SET") {
      standaloneComponentIds[node.id] = {
        id: node.id,
        name: node.name
      };
      componentNameMap[node.name] = node.id;
      console.log("[scanFileForComponents] Found standalone component:", node.name);
      recordComponentInfo(node);
    }
    
    // Count instances, but exclude those nested inside other instances or inside component definitions
    if (node.type === "INSTANCE") {
      // Only count if:
      // 1. Not inside another instance (exclude nested instances)
      // 2. Not inside a component definition (exclude instances that are part of component structure)
      var shouldCount = !isInsideInstance && 
                        parentType !== "COMPONENT" && 
                        parentType !== "COMPONENT_SET";
      
      if (shouldCount) {
        totalInstanceCount++;
        
        // Collect instance data for detachment checking
        var mainComponent = null;
        if ("mainComponent" in node && node.mainComponent) {
          mainComponent = node.mainComponent;
          // Track usage of this component name
          var compName = mainComponent.name || "Unnamed Component";
          componentUsageMap[compName] = (componentUsageMap[compName] || 0) + 1;
          recordComponentInfo(mainComponent);
        }
        
        instancesData.push({
          node: node,
          mainComponent: mainComponent
        });
        
        if (totalInstanceCount <= 10 || totalInstanceCount % 100 === 0) {
          // Log only first 10 instances and every 100th instance to avoid console spam
          console.log("[scanFileForComponents] Counting instance #" + totalInstanceCount + ":", node.name);
        }
      } else {
        if (totalInstanceCount <= 10) {
          console.log("[scanFileForComponents] Skipping nested instance:", node.name, "(parent type:", parentType, ", inside instance:", isInsideInstance + ")");
        }
      }
    }
    
    // Track frames/groups that might be detached instances
    // These are top-level frames/groups that aren't inside other instances or components
    if ((node.type === "FRAME" || node.type === "GROUP") && !isInsideInstance && 
        parentType !== "COMPONENT" && parentType !== "COMPONENT_SET") {
      // Store for later analysis
      suspiciousFrames.push({
        node: node,
        name: node.name
      });
    }
    
    // Recursively traverse children, passing current node type and instance status
    if ("children" in node && Array.isArray(node.children)) {
      // If current node is an instance, mark children as being inside an instance
      // Also check if this is a frame/group that matches a component name (likely detached)
      var isLikelyDetached = (node.type === "FRAME" || node.type === "GROUP") && 
                             componentNameMap[node.name] !== undefined;
      var childIsInsideInstance = isInsideInstance || node.type === "INSTANCE" || isLikelyDetached;
      
      for (var i = 0; i < node.children.length; i++) {
        traverseNode(node.children[i], node.type, childIsInsideInstance);
      }
    }
  }
  
  // Traverse all pages
  var pages = figma.root.children;
  for (var i = 0; i < pages.length; i++) {
    console.log("[scanFileForComponents] Scanning page:", pages[i].name);
    traverseNode(pages[i], null, false);
  }
  
  // Check for detachments
  console.log("[scanFileForComponents] Checking for detachments...");
  console.log("[scanFileForComponents] Component names tracked:", Object.keys(componentNameMap).length);
  console.log("[scanFileForComponents] Component usage tracked:", Object.keys(componentUsageMap).length);
  console.log("[scanFileForComponents] Suspicious frames to check:", suspiciousFrames.length);
  
  // 1. Check connected instances that lost their mainComponent reference
  for (var i = 0; i < instancesData.length; i++) {
    var instance = instancesData[i].node;
    var mainComp = instancesData[i].mainComponent;
    
    if (!mainComp) {
      console.log("[scanFileForComponents] Detachment found (instance with no main component):", instance.name);
      detachmentCount++;
    } else {
      if (i < 5) {
        console.log("[scanFileForComponents] Instance connected:", instance.name, "→", mainComp.name);
      }
    }
  }
  
  // 2. Check frames/groups that have names matching component names
  // These are likely detached instances
  for (var i = 0; i < suspiciousFrames.length; i++) {
    var frame = suspiciousFrames[i];
    var frameName = frame.name;
    var possibleMatch = false;
    
    // Check if this frame's name matches any known component name (local components)
    if (componentNameMap[frameName]) {
      possibleMatch = true;
    }
    
    // Also check if this frame's name matches any component name used by instances (remote or local)
    if (componentUsageMap[frameName]) {
      possibleMatch = true;
    }
    
    if (possibleMatch) {
      console.log("[scanFileForComponents] Potential detached instance found:", frameName, "(matches component name)");
      detachmentCount++;
      detachedNodes.push(frame.node);
    }
  }
  
  console.log("[scanFileForComponents] Total detachments found:", detachmentCount);
  
  var trackedComponentIds = Object.keys(trackedComponents);
  var componentsWithoutDocs = 0;
  var componentsWithoutCode = 0;
  for (var compIdx = 0; compIdx < trackedComponentIds.length; compIdx++) {
    var compInfo = trackedComponents[trackedComponentIds[compIdx]];
    if (compInfo && !compInfo.hasDocs) {
      componentsWithoutDocs++;
    }
    if (compInfo && !compInfo.hasCode) {
      componentsWithoutCode++;
    }
  }
  
  console.log("[scanFileForComponents] Components tracked:", trackedComponentIds.length);
  console.log("[scanFileForComponents] Components without documentation:", componentsWithoutDocs);
  console.log("[scanFileForComponents] Components without code connect:", componentsWithoutCode);
  
  // Total unique components = component sets + standalone components
  var componentCount = Object.keys(componentSetIds).length + Object.keys(standaloneComponentIds).length;
  
  console.log("[scanFileForComponents] Scan complete.");
  console.log("[scanFileForComponents] Component Sets:", Object.keys(componentSetIds).length);
  console.log("[scanFileForComponents] Standalone Components:", Object.keys(standaloneComponentIds).length);
  console.log("[scanFileForComponents] Total Unique Components:", componentCount);
  console.log("[scanFileForComponents] Total Instances:", totalInstanceCount);
  console.log("[scanFileForComponents] Detachments:", detachmentCount);
  
  // Send initial results to UI (without out of date count yet)
  figma.ui.postMessage({
    type: "overview-stats",
    componentCount: componentCount,
    totalInstanceCount: totalInstanceCount,
    detachmentCount: detachmentCount,
    componentsWithoutDocs: componentsWithoutDocs,
    componentsWithoutCode: componentsWithoutCode,
    outOfDateCount: null
  });
  
  // Check for out of date components (async operation)
  console.log("[scanFileForComponents] Starting async check for out of date components...");
  checkForOutOfDateComponents(
    instancesData,
    componentCount,
    totalInstanceCount,
    detachmentCount,
    componentsWithoutDocs,
    componentsWithoutCode
  );
}

async function checkForOutOfDateComponents(
  instancesData,
  componentCount,
  totalInstanceCount,
  detachmentCount,
  componentsWithoutDocs,
  componentsWithoutCode
) {
  console.log("[checkForOutOfDateComponents] Starting async check...");
  var uniqueComponents = {};
  var outOfDateCount = 0;
  
  try {
    // First, collect unique library components to avoid checking duplicates
    for (var i = 0; i < instancesData.length; i++) {
      var mainComp = instancesData[i].mainComponent;
      
      if (mainComp && mainComp.remote === true && mainComp.key) {
        if (!uniqueComponents[mainComp.key]) {
          uniqueComponents[mainComp.key] = {
            component: mainComp,
            name: mainComp.name
          };
        }
      }
    }
    
    var componentKeys = Object.keys(uniqueComponents);
    console.log("[checkForOutOfDateComponents] Checking", componentKeys.length, "unique library components for updates...");
    
    // Check each unique component for updates
    for (var i = 0; i < componentKeys.length; i++) {
      var key = componentKeys[i];
      var mainComp = uniqueComponents[key].component;
      
      try {
        // Try to import the latest version of the component
        var latestComponent = await figma.importComponentByKeyAsync(key);
        
        // If we can import it and it's different from the current main component,
        // it means there's an update available
        if (latestComponent && latestComponent.id !== mainComp.id) {
          outOfDateCount++;
          if (outOfDateCount <= 5) {
            console.log("[checkForOutOfDateComponents] Update available for:", mainComp.name);
          }
        }
      } catch (e) {
        // If import fails, the component might not be accessible or doesn't have updates
        // This is normal, so we just skip it
      }
    }
    
    // Also check for style updates
    var localStyles = figma.getLocalPaintStyles().concat(
      figma.getLocalTextStyles(),
      figma.getLocalEffectStyles(),
      figma.getLocalGridStyles()
    );
    
    for (var i = 0; i < localStyles.length; i++) {
      var style = localStyles[i];
      if (style.remote === true && style.key) {
        try {
          // Check if we can get a newer version
          var latestStyle = await figma.importStyleByKeyAsync(style.key);
          if (latestStyle && latestStyle.id !== style.id) {
            outOfDateCount++;
            if (outOfDateCount <= 10) {
              console.log("[checkForOutOfDateComponents] Style update available:", style.name);
            }
          }
        } catch (e) {
          // Style might not be accessible or doesn't have updates
        }
      }
    }
    
    console.log("[checkForOutOfDateComponents] Check complete. Out of date components:", outOfDateCount);
  } catch (e) {
    console.log("[checkForOutOfDateComponents] Error during check:", e);
    outOfDateCount = 0;
  }
  
  // Send results to UI
  figma.ui.postMessage({
    type: "overview-stats",
    componentCount: componentCount,
    totalInstanceCount: totalInstanceCount,
    detachmentCount: detachmentCount,
    componentsWithoutDocs: componentsWithoutDocs,
    componentsWithoutCode: componentsWithoutCode,
    outOfDateCount: outOfDateCount
  });
}

// Check initial selection when plugin loads
console.log("[PLUGIN INIT] Checking initial selection");
setTimeout(function() {
  console.log("[PLUGIN INIT] Initial selection check timeout fired");
  resolveDocumentationFromSelection();
  // Also scan for components
  scanFileForComponents();
}, 100);
