import React, { useEffect, useState } from 'react';
import { ChromePicker } from 'react-color';

function getColorsFromFabricJSON(json) {
  const colorSet = new Set();

  const checkAndAddColor = (value) => {
    if (typeof value === 'string' && /^#[0-9A-F]{3,6}$/i.test(value)) {
      colorSet.add(value.toLowerCase());
    }
  };

  const walk = (obj) => {
    if (typeof obj !== 'object' || obj === null) return;
    for (const key in obj) {
      const value = obj[key];
      if (['fill', 'stroke', 'backgroundColor'].includes(key)) {
        checkAndAddColor(value);
      }
      if (typeof value === 'object') {
        walk(value);
      }
    }
  };

  if (json.objects) {
    json.objects.forEach(walk);
  } else {
    walk(json);
  }

  return Array.from(colorSet);
}

const PaletaHorizontal = ({ canvas }) => {
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#000000');

  useEffect(() => {
    if (!canvas) return;

    const json = canvas.toJSON();
    const extractedColors = getColorsFromFabricJSON(json);
    setColors(extractedColors);

    const active = canvas.getActiveObject();
    if (active?.fill) setSelectedColor(active.fill);
  }, [canvas]);

const applyColor = (hex) => {
  const activeObject = canvas.getActiveObject();

  // Se não há objeto ativo ou se for a própria página
  if (!activeObject || activeObject.name === 'page') {
    if (canvas.page) {
      canvas.page.set({ fill: hex });
    }
  } else {
    if (activeObject.type === 'group' || activeObject.type === 'path-group') {
      activeObject.getObjects().forEach((obj) => {
        if (obj.set) {
          obj.set({ fill: hex, stroke: hex });
        }
      });
    } else {
      activeObject.set({ fill: hex, stroke: hex });
    }
  }

  canvas.requestRenderAll();
};


const activateEyedropper = async () => {
  try {
    const eyeDropper = new window.EyeDropper();
    const { sRGBHex } = await eyeDropper.open();
    setSelectedColor(sRGBHex);
    applyColor(sRGBHex);
  } catch (e) {
    console.error("EyeDropper failed", e);
  }
};


  return (
    <div>

      {/* Paleta horizontal das cores do canvas */}
      {colors.length > 0 && (
        <>
          
          <div
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 8,
            }}
          >
            {colors.map((color) => (
              <div
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  applyColor(color);
                }}
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: color,
                  border:
                    color === selectedColor ? '2px solid black' : '1px solid #ccc',
                  borderRadius: 4,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
            ))}



 {/* Conta gostas */}
     
            <div 
              style={{
                  width: 28,
                  height: 28,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
          onClick={activateEyedropper}><i class="fa-solid fa-eye-dropper"></i>
          </div>



          </div>
        </>
      )}

     


           {/* Picker personalizado */}


          <ChromePicker
          color={selectedColor}
          onChange={(color) => {
            setSelectedColor(color.hex);
            applyColor(color.hex);
          }}
          styles={{
            default: {
              picker: {
                width: '100%',
              },
            },
          }}
        />

        

        </div>
    
  
  );
};

export default PaletaHorizontal;
