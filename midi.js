let midiAccess = null;
let outputs = [];

let midiOutput = null;

const selectDevice = document.getElementById('midiSelectDevice');
const midiModalBtn = document.getElementById('midiModalBtn');

function syncMidiModalButtonVisibility() {
  if (!midiModalBtn) return;
  midiModalBtn.style.display = midiOutput ? '' : 'none';
}

syncMidiModalButtonVisibility();

const upper = 3;
const lower = 4;

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess({ sysex: true })
    .then((access) => {
      midiAccess = access;
      outputs = Array.from(midiAccess.outputs.values());

      if (outputs.length === 0 && document.getElementById("midiError")) {
        document.getElementById("midiError").textContent = "❌ No MIDI outputs found";
        const midiManual = document.getElementById("midiManual");
        if (midiManual) {
          midiManual.remove();
        }
        const midiSelectDevice = document.getElementById("midiSelectDevice");
        if (midiSelectDevice) {
          midiSelectDevice.remove();
        }
        syncMidiModalButtonVisibility();
        return;
      }
      else {
        document.getElementById("midiError")?.remove();
      }

      // По умолчанию выбираем первые устройства
      midiOutput = outputs[0];
      syncMidiModalButtonVisibility();

      // Заполняем селект
      if (selectDevice && document.getElementById('midiSelectDevice')) {
        fillSelect(selectDevice, outputs);

        selectDevice.value = midiOutput.id;
        // Обработчики выбора устройства
        selectDevice.addEventListener('change', () => {
          const id = selectDevice.value;
          midiOutput = outputs.find(o => o.id === id);
          console.log('Selected output:', midiOutput?.name);
          syncMidiModalButtonVisibility();
        });
      }

    })
    .catch((err) => {
      console.error("Failed to get MIDI access:", err);
      const errEl = document.getElementById("midiError");
      if (errEl) errEl.textContent = "Failed to get MIDI access";
      document.getElementById("midiSelectDevice")?.remove();
      syncMidiModalButtonVisibility();
    });
} else {
  console.error("Web MIDI API is not supported in this browser.");
  const errEl = document.getElementById("midiError");
  if (errEl) errEl.textContent = "Web MIDI API is not supported in this browser.";
  document.getElementById("midiSelectDevice")?.remove();
  syncMidiModalButtonVisibility();
}


function fillSelect(selectElem, outputs) {
  if (selectElem === null) {
    console.log('Object from argument selectElem not found');
    return;
  }
  selectElem.innerHTML = '';
  outputs.forEach(output => {
    const option = document.createElement('option');
    option.value = output.id;
    option.textContent = output.name;
    selectElem.appendChild(option);
  });
}

function toneData() {
  return [
    // Таблица 1
    { "id": 1, "name": "GrandPianoV", "msb": 56, "lsb": 6, "program_change": 0 },
    { "id": 2, "name": "Grand Piano", "msb": 56, "lsb": 2, "program_change": 0 },
    { "id": 3, "name": "GrandPianoV2", "msb": 56, "lsb": 7, "program_change": 0 },
    { "id": 4, "name": "Rock Piano", "msb": 79, "lsb": 1, "program_change": 0 },
    { "id": 5, "name": "Mono Piano", "msb": 79, "lsb": 3, "program_change": 0 },
    { "id": 7, "name": "JD Piano", "msb": 79, "lsb": 2, "program_change": 0 },
    { "id": 8, "name": "SA Piano", "msb": 79, "lsb": 4, "program_change": 0 },
    { "id": 10, "name": "Honky-tonk", "msb": 57, "lsb": 0, "program_change": 0 },
    { "id": 11, "name": "Echo Piano", "msb": 56, "lsb": 10, "program_change": 0 },
    { "id": 12, "name": "European Pno", "msb": 56, "lsb": 9, "program_change": 0 },
    { "id": 13, "name": "Classic Pno", "msb": 56, "lsb": 8, "program_change": 0 },

    // Таблица 2
    { "id": 15, "name": "Vintage EP", "msb": 58, "lsb": 6, "program_change": 0 },
    { "id": 16, "name": "Stone EP", "msb": 58, "lsb": 13, "program_change": 0 },
    { "id": 18, "name": "Tremolo EP", "msb": 58, "lsb": 14, "program_change": 0 },
    { "id": 19, "name": "Dyno E.Piano", "msb": 58, "lsb": 3, "program_change": 0 },
    { "id": 20, "name": "'60s E.Piano", "msb": 58, "lsb": 5, "program_change": 0 },
    { "id": 21, "name": "'60s TremEP", "msb": 58, "lsb": 12, "program_change": 0 },
    { "id": 24, "name": "FM EP 1", "msb": 59, "lsb": 2, "program_change": 0 },
    { "id": 25, "name": "FM EP 2", "msb": 59, "lsb": 3, "program_change": 0 },
    { "id": 26, "name": "80's EP", "msb": 59, "lsb": 4, "program_change": 0 },
    { "id": 27, "name": "Pure EP *1", "msb": 59, "lsb": 5, "program_change": 0 },
    { "id": 28, "name": "Phase EP *1", "msb": 59, "lsb": 6, "program_change": 0 },
    { "id": 29, "name": "Tremolo EP 2 *1", "msb": 59, "lsb": 7, "program_change": 0 },
    { "id": 30, "name": "VR EP 1 *1", "msb": 59, "lsb": 8, "program_change": 0 },
    { "id": 31, "name": "VR EP 2 *1", "msb": 59, "lsb": 9, "program_change": 0 },
    { "id": 32, "name": "Pure Wurly *1", "msb": 59, "lsb": 10, "program_change": 0 },
    { "id": 33, "name": "SA EP *1", "msb": 59, "lsb": 11, "program_change": 0 },
    { "id": 34, "name": "SA EP Stack *1", "msb": 59, "lsb": 12, "program_change": 0 },
    { "id": 35, "name": "Metalic EP *1", "msb": 59, "lsb": 13, "program_change": 0 },
    { "id": 36, "name": "Hybrid EP *1", "msb": 59, "lsb": 14, "program_change": 0 },

    // Таблица 3
    { "id": 37, "name": "Clav 1", "msb": 80, "lsb": 3, "program_change": 0 },
    { "id": 38, "name": "Clav 2", "msb": 80, "lsb": 4, "program_change": 0 },
    { "id": 39, "name": "Phase Clav 1", "msb": 80, "lsb": 6, "program_change": 0 },
    { "id": 40, "name": "T-Wah Clav", "msb": 80, "lsb": 9, "program_change": 0 },
    { "id": 41, "name": "Comp Clav", "msb": 80, "lsb": 10, "program_change": 0 },
    { "id": 42, "name": "BrillClav DB", "msb": 80, "lsb": 1, "program_change": 0 },
    { "id": 43, "name": "Pulse Clav", "msb": 80, "lsb": 8, "program_change": 0 },
    { "id": 44, "name": "Phase Clav 2", "msb": 80, "lsb": 7, "program_change": 0 },
    { "id": 45, "name": "Clav 3", "msb": 80, "lsb": 2, "program_change": 0 },
    { "id": 46, "name": "Velo Clav", "msb": 80, "lsb": 5, "program_change": 0 },

    // Таблица 4
    { "id": 47, "name": "Harmonderca", "msb": 73, "lsb": 4, "program_change": 0 },
    { "id": 48, "name": "BluesHarp", "msb": 73, "lsb": 5, "program_change": 0 },
    { "id": 49, "name": "Accordion", "msb": 72, "lsb": 5, "program_change": 0 },
    { "id": 50, "name": "Fr Musset", "msb": 72, "lsb": 1, "program_change": 0 },
    { "id": 51, "name": "La Seine", "msb": 72, "lsb": 8, "program_change": 0 },
    { "id": 52, "name": "Bandoneon", "msb": 85, "lsb": 0, "program_change": 0 },
    { "id": 56, "name": "OrganBell", "msb": 47, "lsb": 14, "program_change": 0 },
    { "id": 57, "name": "Fantasy", "msb": 47, "lsb": 9, "program_change": 0 },
    { "id": 58, "name": "HarpsiSingle", "msb": 66, "lsb": 1, "program_change": 0 },
    { "id": 59, "name": "HarpsiDouble", "msb": 66, "lsb": 2, "program_change": 0 },
    { "id": 60, "name": "Celesta", "msb": 81, "lsb": 0, "program_change": 0 },
    { "id": 61, "name": "Harp", "msb": 67, "lsb": 0, "program_change": 0 },
    { "id": 62, "name": "Hard Organ", "msb": 12, "lsb": 0, "program_change": 0 },
    { "id": 63, "name": "Mad Organ", "msb": 13, "lsb": 0, "program_change": 0 },
    { "id": 64, "name": "Pipe Organ1", "msb": 20, "lsb": 0, "program_change": 0 },
    { "id": 65, "name": "Pipe Organ2", "msb": 21, "lsb": 0, "program_change": 0 },
    { "id": 66, "name": "Pipe Organ3", "msb": 25, "lsb": 0, "program_change": 0 },
    { "id": 67, "name": "Gospel Or.1", "msb": 26, "lsb": 0, "program_change": 0 },
    { "id": 68, "name": "Gospel Or.2", "msb": 27, "lsb": 0, "program_change": 0 },
    { "id": 69, "name": "Gospel Or.3", "msb": 31, "lsb": 0, "program_change": 0 },

    // Таблица 5
    { "id": 70, "name": "JP8 Brass", "msb": 89, "lsb": 1, "program_change": 0 },
    { "id": 71, "name": "80s Brs 1", "msb": 89, "lsb": 4, "program_change": 0 },
    { "id": 72, "name": "Hybrid Brass", "msb": 89, "lsb": 8, "program_change": 0 },
    { "id": 73, "name": "JUNO Brs", "msb": 89, "lsb": 2, "program_change": 0 },
    { "id": 74, "name": "Soft Syn Brs", "msb": 89, "lsb": 6, "program_change": 0 },
    { "id": 75, "name": "ResoSweepBrs", "msb": 89, "lsb": 5, "program_change": 0 },
    { "id": 76, "name": "Jmp Brass", "msb": 89, "lsb": 9, "program_change": 0 },
    { "id": 77, "name": "80s Brs 2", "msb": 89, "lsb": 3, "program_change": 0 },
    { "id": 78, "name": "Analog Brs", "msb": 89, "lsb": 7, "program_change": 0 },
    { "id": 81, "name": "FS Brass", "msb": 65, "lsb": 5, "program_change": 0 },
    { "id": 82, "name": "StackTp Sect", "msb": 64, "lsb": 15, "program_change": 0 },
    { "id": 83, "name": "Tp/TbSecStac", "msb": 65, "lsb": 6, "program_change": 0 },
    { "id": 84, "name": "N.Trumpet", "msb": 94, "lsb": 9, "program_change": 0 },
    { "id": 85, "name": "Classical Tp", "msb": 94, "lsb": 10, "program_change": 0 },
    { "id": 86, "name": "Mute Tp", "msb": 95, "lsb": 5, "program_change": 0 },
    { "id": 87, "name": "Harmon Mute", "msb": 95, "lsb": 6, "program_change": 0 },
    { "id": 88, "name": "Cup Mute Tp", "msb": 95, "lsb": 2, "program_change": 0 },
    { "id": 89, "name": "Solo Tb", "msb": 104, "lsb": 6, "program_change": 0 },
    { "id": 90, "name": "Soft Tb", "msb": 104, "lsb": 5, "program_change": 0 },
    { "id": 91, "name": "N.Alto Sax", "msb": 96, "lsb": 6, "program_change": 0 },
    { "id": 92, "name": "Blow Sax", "msb": 96, "lsb": 2, "program_change": 0 },
    { "id": 93, "name": "Soprano Sax", "msb": 105, "lsb": 0, "program_change": 0 },
    { "id": 94, "name": "F.Horns Sect", "msb": 88, "lsb": 10, "program_change": 0 },

    // Таблица 6
    { "id": 95, "name": "JP8 Strings1", "msb": 44, "lsb": 2, "program_change": 0 },
    { "id": 96, "name": "JP8 Strings2", "msb": 44, "lsb": 3, "program_change": 0 },
    { "id": 97, "name": "Syn Strings1", "msb": 44, "lsb": 13, "program_change": 0 },
    { "id": 98, "name": "Syn Strings2", "msb": 44, "lsb": 14, "program_change": 0 },
    { "id": 99, "name": "JUNO Str 1", "msb": 44, "lsb": 4, "program_change": 0 },
    { "id": 100, "name": "JUNO Str 2", "msb": 44, "lsb": 5, "program_change": 0 },
    { "id": 101, "name": "OB Strings", "msb": 44, "lsb": 6, "program_change": 0 },
    { "id": 102, "name": "Vintage", "msb": 44, "lsb": 7, "program_change": 0 },
    { "id": 103, "name": "Oct Str", "msb": 44, "lsb": 8, "program_change": 0 },
    { "id": 104, "name": "Brite Str", "msb": 44, "lsb": 9, "program_change": 0 },
    { "id": 105, "name": "Digi Str", "msb": 44, "lsb": 10, "program_change": 0 },
    { "id": 106, "name": "Hybrid Str", "msb": 44, "lsb": 11, "program_change": 0 },
    { "id": 107, "name": "Phase Str", "msb": 44, "lsb": 12, "program_change": 0 },
    { "id": 108, "name": "Full Strings", "msb": 41, "lsb": 5, "program_change": 0 },
    { "id": 109, "name": "Dyn Strings", "msb": 41, "lsb": 4, "program_change": 0 },
    { "id": 110, "name": "Slow Strings", "msb": 42, "lsb": 4, "program_change": 0 },
    { "id": 111, "name": "Mood Strings", "msb": 42, "lsb": 3, "program_change": 0 },
    { "id": 112, "name": "Pizzicato", "msb": 55, "lsb": 0, "program_change": 0 },
    { "id": 113, "name": "Violin", "msb": 92, "lsb": 6, "program_change": 0 },
    { "id": 114, "name": "Cello", "msb": 93, "lsb": 0, "program_change": 0 },

    // Таблица 7
    { "id": 115, "name": "Saw Lead 1", "msb": 111, "lsb": 11, "program_change": 0 },
    { "id": 116, "name": "Super Saw Ld", "msb": 111, "lsb": 13, "program_change": 0 },
    { "id": 118, "name": "Pure Lead", "msb": 110, "lsb": 6, "program_change": 0 },
    { "id": 119, "name": "Sine Lead 1", "msb": 110, "lsb": 15, "program_change": 0 },
    { "id": 121, "name": "Sky Bit", "msb": 111, "lsb": 6, "program_change": 0 },
    { "id": 122, "name": "Punker", "msb": 63, "lsb": 10, "program_change": 0 },
    { "id": 123, "name": "Fat GR Lead", "msb": 110, "lsb": 14, "program_change": 0 },
    { "id": 125, "name": "OSC-SyncLd 1", "msb": 111, "lsb": 3, "program_change": 0 },
    { "id": 126, "name": "OSC-SyncLd 2", "msb": 111, "lsb": 2, "program_change": 0 },
    { "id": 127, "name": "Saw Lead 2", "msb": 110, "lsb": 8, "program_change": 0 },
    { "id": 128, "name": "Saw Lead 3", "msb": 111, "lsb": 10, "program_change": 0 },
    { "id": 129, "name": "Square Lead1", "msb": 110, "lsb": 12, "program_change": 0 },
    { "id": 130, "name": "Square Lead2", "msb": 110, "lsb": 13, "program_change": 0 },
    { "id": 132, "name": "Pulse Lead", "msb": 110, "lsb": 11, "program_change": 0 },
    { "id": 134, "name": "LP Dist", "msb": 63, "lsb": 8, "program_change": 0 },
    { "id": 135, "name": "FS Plugged", "msb": 63, "lsb": 9, "program_change": 0 },
    { "id": 136, "name": "Pure Square", "msb": 111, "lsb": 12, "program_change": 0 },
    { "id": 137, "name": "Trance Key", "msb": 109, "lsb": 14, "program_change": 0 },
    { "id": 138, "name": "Bit Poly 1", "msb": 111, "lsb": 9, "program_change": 0 },
    { "id": 139, "name": "Bit Poly 2", "msb": 111, "lsb": 5, "program_change": 0 },
    { "id": 140, "name": "Tekno Lead", "msb": 111, "lsb": 4, "program_change": 0 },
    { "id": 141, "name": "Saws Key", "msb": 109, "lsb": 5, "program_change": 0 },
    { "id": 142, "name": "Super Saws", "msb": 110, "lsb": 10, "program_change": 0 },
    { "id": 143, "name": "Poly Slice", "msb": 111, "lsb": 8, "program_change": 0 },
    { "id": 144, "name": "Poly Syn 1", "msb": 109, "lsb": 6, "program_change": 0 },
    { "id": 145, "name": "Poly Syn 2", "msb": 109, "lsb": 7, "program_change": 0 },
    { "id": 146, "name": "Poly Syn 3", "msb": 109, "lsb": 8, "program_change": 0 },
    { "id": 147, "name": "Wire String", "msb": 109, "lsb": 9, "program_change": 0 },
    { "id": 148, "name": "Cutter Key", "msb": 109, "lsb": 10, "program_change": 0 },
    { "id": 149, "name": "Digi Key 1", "msb": 109, "lsb": 11, "program_change": 0 },
    { "id": 150, "name": "Digi Key 2", "msb": 109, "lsb": 12, "program_change": 0 },
    { "id": 151, "name": "J-Pop Kira", "msb": 109, "lsb": 13, "program_change": 0 },
    { "id": 152, "name": "Sqr Key", "msb": 109, "lsb": 15, "program_change": 0 },
    { "id": 153, "name": "JP80 SynHarp", "msb": 47, "lsb": 13, "program_change": 0 },
    { "id": 154, "name": "Bell Key", "msb": 47, "lsb": 15, "program_change": 0 },
    { "id": 155, "name": "AnalogBell 1", "msb": 47, "lsb": 11, "program_change": 0 },
    { "id": 156, "name": "AnalogBell 2", "msb": 47, "lsb": 12, "program_change": 0 },
    { "id": 157, "name": "Pipe Key", "msb": 52, "lsb": 12, "program_change": 0 },
    { "id": 159, "name": "SEQ 1", "msb": 110, "lsb": 7, "program_change": 0 },
    { "id": 160, "name": "SEQ 2", "msb": 110, "lsb": 5, "program_change": 0 },
    { "id": 161, "name": "Crossfire", "msb": 110, "lsb": 9, "program_change": 0 },
    { "id": 162, "name": "Bodyart", "msb": 111, "lsb": 7, "program_change": 0 },
    { "id": 163, "name": "SL JP8 5th *1", "msb": 1, "lsb": 1, "program_change": 0 },
    { "id": 164, "name": "SL JP8 Key *1", "msb": 1, "lsb": 3, "program_change": 0 },
    { "id": 165, "name": "SL JP6 Ld 1 *1", "msb": 1, "lsb": 5, "program_change": 0 },
    { "id": 166, "name": "SL JP6 Ld 2 *1", "msb": 1, "lsb": 8, "program_change": 0 },
    { "id": 167, "name": "SL Juno ODLd *1", "msb": 1, "lsb": 11, "program_change": 0 },
    { "id": 168, "name": "SL Juno Key *1", "msb": 1, "lsb": 13, "program_change": 0 },
    { "id": 169, "name": "SL D50 Pizz *1", "msb": 1, "lsb": 14, "program_change": 0 },
    { "id": 170, "name": "SL D50 SftLd *1", "msb": 1, "lsb": 15, "program_change": 0 },

    // Таблица 8
    { "id": 174, "name": "Syn Bass", "msb": 123, "lsb": 3, "program_change": 0 },
    { "id": 175, "name": "MG Bass", "msb": 123, "lsb": 2, "program_change": 0 },
    { "id": 176, "name": "Fat Analog", "msb": 123, "lsb": 11, "program_change": 0 },
    { "id": 177, "name": "Detune Bs 1", "msb": 123, "lsb": 5, "program_change": 0 },
    { "id": 178, "name": "PWM Bass", "msb": 124, "lsb": 2, "program_change": 0 },
    { "id": 179, "name": "Unison Bs", "msb": 123, "lsb": 7, "program_change": 0 },
    { "id": 180, "name": "Monster Bs", "msb": 123, "lsb": 12, "program_change": 0 },
    { "id": 182, "name": "Finger Bs", "msb": 118, "lsb": 5, "program_change": 0 },
    { "id": 183, "name": "RichFretless", "msb": 118, "lsb": 7, "program_change": 0 },
    { "id": 184, "name": "N.AcousticBs", "msb": 117, "lsb": 6, "program_change": 0 },
    { "id": 185, "name": "Detune Bs 2", "msb": 123, "lsb": 14, "program_change": 0 },
    { "id": 186, "name": "Detune Bs 3", "msb": 123, "lsb": 15, "program_change": 0 },
    { "id": 187, "name": "Low Bass", "msb": 123, "lsb": 10, "program_change": 0 },
    { "id": 188, "name": "FM Bass", "msb": 123, "lsb": 4, "program_change": 0 },
    { "id": 189, "name": "P5 Bass", "msb": 123, "lsb": 6, "program_change": 0 },
    { "id": 190, "name": "Camblast", "msb": 123, "lsb": 8, "program_change": 0 },
    { "id": 191, "name": "Reso Bs", "msb": 123, "lsb": 9, "program_change": 0 },
    { "id": 192, "name": "Carmelcorn", "msb": 123, "lsb": 13, "program_change": 0 },
    { "id": 193, "name": "Fretless Bs", "msb": 118, "lsb": 6, "program_change": 0 },
    { "id": 194, "name": "Picked Bs", "msb": 119, "lsb": 2, "program_change": 0 },
    { "id": 195, "name": "Slap Bass", "msb": 119, "lsb": 3, "program_change": 0 },
    { "id": 196, "name": "Chicken Bass", "msb": 119, "lsb": 4, "program_change": 0 },

    // Таблица 9
    { "id": 197, "name": "Soft Pad 1", "msb": 46, "lsb": 8, "program_change": 0 },
    { "id": 198, "name": "Str Pad", "msb": 45, "lsb": 10, "program_change": 0 },
    { "id": 199, "name": "Atk Pad", "msb": 45, "lsb": 11, "program_change": 0 },
    { "id": 200, "name": "Heaven Pad", "msb": 46, "lsb": 10, "program_change": 0 },
    { "id": 201, "name": "Sweep Pad", "msb": 47, "lsb": 5, "program_change": 0 },
    { "id": 202, "name": "Dreaming", "msb": 47, "lsb": 10, "program_change": 0 },
    { "id": 203, "name": "Stone Pad", "msb": 47, "lsb": 3, "program_change": 0 },
    { "id": 204, "name": "Syn Pad 1", "msb": 46, "lsb": 14, "program_change": 0 },
    { "id": 205, "name": "JP8 Hollow", "msb": 46, "lsb": 11, "program_change": 0 },
    { "id": 206, "name": "Soft Pad 2", "msb": 46, "lsb": 7, "program_change": 0 },
    { "id": 207, "name": "Soft Pad 3", "msb": 46, "lsb": 6, "program_change": 0 },
    { "id": 208, "name": "JP8 Stone", "msb": 47, "lsb": 4, "program_change": 0 },
    { "id": 209, "name": "Organ Pad", "msb": 46, "lsb": 9, "program_change": 0 },
    { "id": 210, "name": "Glass Pad", "msb": 46, "lsb": 12, "program_change": 0 },
    { "id": 211, "name": "Slow Pad", "msb": 46, "lsb": 15, "program_change": 0 },
    { "id": 212, "name": "Syn Pad 2", "msb": 46, "lsb": 13, "program_change": 0 },
    { "id": 213, "name": "Trance Pad", "msb": 47, "lsb": 6, "program_change": 0 },
    { "id": 214, "name": "5th Pad", "msb": 47, "lsb": 7, "program_change": 0 },
    { "id": 215, "name": "LFO Hollow", "msb": 47, "lsb": 8, "program_change": 0 },
    { "id": 216, "name": "SL JP8 BrtPd *1", "msb": 1, "lsb": 2, "program_change": 0 },
    { "id": 217, "name": "SL JP8 SftPd *1", "msb": 1, "lsb": 4, "program_change": 0 },
    { "id": 218, "name": "SL JP6 LFOPd *1", "msb": 1, "lsb": 6, "program_change": 0 },
    { "id": 219, "name": "SL Juno Sft *1", "msb": 1, "lsb": 9, "program_change": 0 },
    { "id": 220, "name": "SL Juno LFO *1", "msb": 1, "lsb": 10, "program_change": 0 },
    { "id": 221, "name": "SL Juno Uni *1", "msb": 1, "lsb": 12, "program_change": 0 },

    // Таблица 10
    { "id": 222, "name": "Vox Pad 1", "msb": 52, "lsb": 7, "program_change": 0 },
    { "id": 223, "name": "HyperVentChr", "msb": 52, "lsb": 11, "program_change": 0 },
    { "id": 224, "name": "JD80 SoftVox", "msb": 52, "lsb": 6, "program_change": 0 },
    { "id": 225, "name": "Vox Pad 2", "msb": 52, "lsb": 8, "program_change": 0 },
    { "id": 226, "name": "Vox Pad 3", "msb": 52, "lsb": 10, "program_change": 0 },
    { "id": 227, "name": "Syn Vox 1", "msb": 52, "lsb": 5, "program_change": 0 },
    { "id": 228, "name": "Vox Pad 4", "msb": 52, "lsb": 9, "program_change": 0 },
    { "id": 229, "name": "VP-330 Chr", "msb": 50, "lsb": 3, "program_change": 0 },
    { "id": 230, "name": "Jazz Scat", "msb": 49, "lsb": 1, "program_change": 0 },
    { "id": 231, "name": "Jazz Doo", "msb": 49, "lsb": 2, "program_change": 0 },
    { "id": 232, "name": "Classical", "msb": 48, "lsb": 2, "program_change": 0 },
    { "id": 233, "name": "Gregorian", "msb": 48, "lsb": 1, "program_change": 0 },
    { "id": 234, "name": "Choir", "msb": 48, "lsb": 0, "program_change": 0 },

    // Таблица 11
    { "id": 235, "name": "FX 1", "msb": 87, "lsb": 8, "program_change": 0 },
    { "id": 236, "name": "FX 2", "msb": 87, "lsb": 9, "program_change": 0 },
    { "id": 237, "name": "FX 3", "msb": 87, "lsb": 3, "program_change": 0 },
    { "id": 238, "name": "FX 4", "msb": 87, "lsb": 7, "program_change": 0 },
    { "id": 239, "name": "FX 5", "msb": 87, "lsb": 12, "program_change": 0 },
    { "id": 240, "name": "FX 6", "msb": 87, "lsb": 1, "program_change": 0 },
    { "id": 241, "name": "FX 7", "msb": 87, "lsb": 2, "program_change": 0 },
    { "id": 242, "name": "FX 8", "msb": 87, "lsb": 4, "program_change": 0 },
    { "id": 243, "name": "FX 9", "msb": 87, "lsb": 5, "program_change": 0 },
    { "id": 244, "name": "FX 10", "msb": 87, "lsb": 6, "program_change": 0 },
    { "id": 245, "name": "FX 11", "msb": 87, "lsb": 10, "program_change": 0 },
    { "id": 246, "name": "Sci-Fi Sweep", "msb": 87, "lsb": 11, "program_change": 0 },
    { "id": 247, "name": "Hover Dive", "msb": 87, "lsb": 13, "program_change": 0 },
    { "id": 248, "name": "Orch Hit", "msb": 127, "lsb": 6, "program_change": 0 },
    { "id": 249, "name": "Philly Hit", "msb": 127, "lsb": 7, "program_change": 0 },
    { "id": 250, "name": "House Hit", "msb": 127, "lsb": 8, "program_change": 0 },
    { "id": 251, "name": "SL JP6 Fx *1", "msb": 1, "lsb": 7, "program_change": 0 },

    // Таблица 12
    { "id": 252, "name": "Vibraphone", "msb": 68, "lsb": 0, "program_change": 0 },
    { "id": 253, "name": "Marimba", "msb": 69, "lsb": 0, "program_change": 0 },
    { "id": 254, "name": "Glockenspiel", "msb": 82, "lsb": 0, "program_change": 0 },
    { "id": 255, "name": "Xylophone", "msb": 83, "lsb": 0, "program_change": 0 },
    { "id": 256, "name": "Steel Drums", "msb": 91, "lsb": 0, "program_change": 0 },
    { "id": 257, "name": "JC E.Guitar", "msb": 62, "lsb": 2, "program_change": 0 },
    { "id": 258, "name": "Muted Guitar", "msb": 63, "lsb": 4, "program_change": 0 },
    { "id": 267, "name": "Steel-str.Gt", "msb": 61, "lsb": 0, "program_change": 0 },
    { "id": 268, "name": "Jazz Guitar", "msb": 62, "lsb": 0, "program_change": 0 },
    { "id": 260, "name": "Nylon-str.Gt", "msb": 60, "lsb": 0, "program_change": 0 },
    { "id": 261, "name": "Ac.Gtr Sld", "msb": 61, "lsb": 3, "program_change": 0 },
    { "id": 262, "name": "N.Flute", "msb": 98, "lsb": 8, "program_change": 0 },
    { "id": 263, "name": "Andes Mood", "msb": 99, "lsb": 5, "program_change": 0 },
    { "id": 264, "name": "Clarinet", "msb": 101, "lsb": 1, "program_change": 0 },
    { "id": 265, "name": "Oboe", "msb": 100, "lsb": 0, "program_change": 0 }
  ];
}

/**
 * Отправляет несколько MIDI Program Change сообщений, используя данные из toneData().
 *
 * @param {Array<Array>} toneAssignments - Массив массивов, каждый из которых определяет
 * канал и название тона для отправки.
 * Каждый внутренний массив должен содержать:
 * - {number} channel - MIDI-канал (1-16).
 * - {string} toneName - Название тона (строка) из поля "name" в toneData(), соответствующее желаемому тону.
 * Например, "GrandPianoV", "SA Piano" и т.д.
 */
function sendTonesByChannel(toneAssignments) {
  if (!selectedMidiOutput()) {
    return;
  }

  if (!Array.isArray(toneAssignments)) {
    console.error("sendTonesByChannel: Input must be an array of tone assignment arrays.");
    return;
  }

  const allToneData = toneData(); // Получаем весь массив toneData один раз

  toneAssignments.forEach((assignment, index) => {
    // Проверяем, что assignment является массивом и имеет как минимум 2 элемента
    if (!Array.isArray(assignment) || assignment.length < 2) {
      console.warn(`[${new Date().toLocaleTimeString()}] Пропущена отправка тона для задания ${index + 1}. Неверный формат задания.`);
      return;
    }

    const midiChannel = parseInt(assignment[0]) - 1; // MIDI-канал 0-15 (первый элемент массива)
    const toneName = String(assignment[1]);        // Название тона (второй элемент массива)

    if (isNaN(midiChannel) || midiChannel < 0 || midiChannel > 15) {
      console.warn(`[${new Date().toLocaleTimeString()}] Пропущена отправка тона для задания ${index + 1} (Канал ${assignment[0]}). Неверный MIDI-канал.`);
      return;
    }

    // Ищем данные тона по полю 'name'
    // Обратите внимание: поскольку 'name' может быть не уникальным,
    // find() вернет первый найденный тон с этим именем.
    // Если вам нужна уникальность, рассмотрите использование 'id' вместо 'name' для поиска.
    const toneEntry = allToneData.find(tone => tone.name === toneName);

    if (!toneEntry) {
      console.warn(`[${new Date().toLocaleTimeString()}] Предупреждение: Тон с названием "${toneName}" не найден в toneData(). Пропуск.`);
      return;
    }

    // Извлекаем данные из найденного объекта
    const msb = toneEntry.msb;
    const lsb = toneEntry.lsb;
    const program = toneEntry.program_change; // Теперь это program_change из объекта

    // Проверяем, что MSB, LSB, Program являются числами и находятся в допустимом диапазоне MIDI (0-127)
    if (isNaN(msb) || isNaN(lsb) || isNaN(program) ||
      msb < 0 || msb > 127 ||
      lsb < 0 || lsb > 127 ||
      program < 0 || program > 127) {
      console.warn(`[${new Date().toLocaleTimeString()}] Пропущена отправка тона "${toneName}" на канал ${assignment[0]}. Неверные параметры: MSB=${msb}, LSB=${lsb}, Prog=${program}.`);
      return;
    }

    sendMidiPatch(midiChannel, msb, lsb, program, toneEntry.name);

    // Закомментированные строки выше - это стандартные MIDI-сообщения.
    // Для демонстрации я просто вывожу их в консоль.
    // В реальном приложении раскомментируйте их.


  });

  console.log(`[${new Date().toLocaleTimeString()}] Завершена обработка запросов тонов.`);
}


/** Any element with `midi` (and optional `pad`) — e.g. .accordion or .square-gray-button */
function sendFantomSceneChange(element) {
  if (!element || typeof element.getAttribute !== "function") {
    console.warn("sendFantomSceneChange: invalid element");
    return;
  }
  if (!selectedMidiOutput()) {
    return;
  }

  const midiAttr = element.getAttribute("midi");
  if (!midiAttr) {
    console.error("No midi change array");
    return;
  }

  const pad = element.getAttribute("pad");

  // Проверяем формат: две цифры, разделённые запятой
  const match = midiAttr.match(/^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/);
  if (!match) {
    console.error("invalid midi parameters");
    return;
  }

  const lsb = parseInt(match[1], 10);
  const program = parseInt(match[2], 10);

  // Проверка диапазона 0–127 (7-bit MIDI)
  if (lsb < 0 || lsb > 127 || program < 0 || program > 127) return;

  // Вызываем MIDI-функцию
  const midiChannel = 15;
  const msb = 85;
  if (sendMidiPatch(midiChannel, msb, lsb, program)) {
    if (pad) {
      setTimeout(() => {
        handleGreenPadButton(pad);
      }, 500); // миллисекунды
    }
  }

}

function sendMidiCC(midiChannel, controller, value) {
  if (!selectedMidiOutput()) {
    return;
  }
  midiOutput.send([0xB0 + midiChannel, controller, value]);
  console.log(
    `[${new Date().toLocaleTimeString()}] CC${controller}=${value} → канал ${midiChannel + 1}`
  );
}

function sendMidiPatch(midiChannel, msb, lsb, program, toneName = "") {
  try {
    midiOutput.send([0xB0 + midiChannel, 0x00, msb]);
    midiOutput.send([0xB0 + midiChannel, 0x20, lsb]);
    midiOutput.send([0xC0 + midiChannel, program]);

    const log = `[${new Date().toLocaleTimeString()}] Тон ${toneName} отправлен на канал ${midiChannel + 1}. MSB=${msb}, LSB=${lsb}, Prog=${program}`;
    console.log(log);

    return true; // ✔ успешно
  } catch (err) {
    console.error("Ошибка отправки MIDI:", err);
    return false; // ❌ ошибка
  }
}


function sendMidiByForm() {
  // Получаем значения из полей
  const midiChannel = parseInt(document.getElementById('channelA').value, 10) - 1; // MIDI каналы от 0 до 15
  const msb = parseInt(document.getElementById('msbA').value, 10);
  const lsb = parseInt(document.getElementById('lsbA').value, 10);
  const program = parseInt(document.getElementById('programA').value, 10);
  const toneName = document.getElementById('toneSelect').selectedOptions[0].text;
  sendMidiPatch(midiChannel, msb, lsb, program, toneName);
}
// Предполагаемые константы (как у вас)

// Пример использования новой функции:
// Предполагается, что 'midiOutput' инициализирован и доступен.
// global.midiOutput = {
//   send: (message) => console.log("MIDI Send:", message)
// };


// sendTonesByChannel([
//   [upper, "Grand PianoV"],
//   [lower, "SA Piano"]
// ]);

// sendTonesByChannel([
//     [1, "Vintage EP"],
//     [2, "FM EP 1"],
//     [upper, "My Non-Existent Tone"] // Пример несуществующего тона
// ]);

function sendMidiTest() {
  alert("Test Send Midi");
  sendTonesByChannel([
    [upper, "GrandPianoV"],
    [lower, "Vintage EP"]
  ]);

}

// Храним HTML как строку
const midiManual = `
<div class="accordion" id="midiManual">
  <button class="toggle-button">
    <span class="artist">MIDI</span>
  </button>
  <div class="content" id="midiContent">
    <select id="toneSelect"></select><span><pre id='toneByDigit'></pre></span>
    <table border="1" cellpadding="10">
      <tr>
        <td>
          <h3>Patch A</h3>	
          <table style="width: auto;">
            <tr><td><label for="channelA">Channel:</label></td><td><input type="number" id="channelA" min="1" max="16" value="3"></td></tr>
            <tr><td><label for="msbA">MSB:</label></td><td><input type="number" id="msbA" min="0" max="127" value="0"></td></tr>
            <tr><td><label for="lsbA">LSB:</label></td><td><input type="number" id="lsbA" min="0" max="127" value="0"></td></tr>
            <tr><td><label for="programA">Program:</label></td><td><input type="number" id="programA" min="0" max="127" value="0"></td></tr>
          </table>
          <button onclick="sendMidiByForm()">Send MIDI By Form</button>
          <pre id="log"></pre>
        </td>
      </tr>
    </table>
  </div>
</div>
`;

// Функция вставки в указанный контейнер
function insertMidiManualAccordion(targetSelector) {
  const container = document.querySelector(targetSelector);
  if (container) {
    container.innerHTML += midiManual;
  } else {
    console.warn('Target container not found:', targetSelector);
  }
}

function sendSysEx(dataArray, description = "") {
  if (!selectedMidiOutput()) {
    return;
  }

  if (!Array.isArray(dataArray) || dataArray.length < 3) {
    console.error("Invalid SysEx data");
    return;
  }

  // Проверим, что сообщение имеет начало и конец SysEx
  if (dataArray[0] !== 0xF0) dataArray.unshift(0xF0);
  if (dataArray[dataArray.length - 1] !== 0xF7) dataArray.push(0xF7);

  try {
    midiOutput.send(dataArray);
    const hexString = dataArray.map(x => x.toString(16).padStart(2, "0").toUpperCase()).join(" ");
    const log = `[${new Date().toLocaleTimeString()}] SysEx sent${description ? " (" + description + ")" : ""} → ${hexString}`;
    console.log(log);
    const logElem = document.getElementById("log");
    if (logElem) logElem.innerHTML = log;
  } catch (e) {
    console.error("Failed to send SysEx:", e);
  }
}

/** Same logic as a click on .square-green-button (pad 1–16). */
function handleGreenPadButton(raw) {
  const n = parseInt(String(raw ?? "").trim(), 10);
  if (!Number.isFinite(n) || n < 1 || n > 16) {
    return;
  }
  getPadSysex(n);
}

function getPadSysex(padNumber) {
  if (padNumber < 1 || padNumber > 16) {
    console.error("Pad number must be between 1 and 16");
    return;
  }

  // Основной шаблон без контрольной суммы и F0/F7
  //  const data = [0x41, 0x10, 0x00, 0x00, 0x00, 0x5B, 0x12, 0x01, 0x00, 0x00, 0x13, padNumber - 1];
  //  const data = [0x41, 0x10, 0x00, 0x00, 0x00, 0x5B, 0x12, 0x01, 0x00, 0x00, 0x13, padNumber - 1, 0x00, 0x00, 0x00, 0x00];
  const data = [0x41, 0x10, 0x00, 0x00, 0x00, 0x5B, 0x12, 0x01, 0x00, 0x00, 0x13, 0x00, 0x00, 0x00, padNumber - 1, 0x00];

  // Расчет Roland checksum
  const checksum = (128 - (data.slice(6).reduce((a, b) => a + b, 0) % 128)) % 128;

  const sysex = [0xF0, ...data, checksum, 0xF7];

  // Отправляем сообщение сразу
  sendSysEx(data, `PAD ${padNumber}`);
  //  sendSysEx(sysex, `PAD ${padNumber}`);

  // При необходимости возвращаем для отладки
  return /*sysex*/;
}

function selectedMidiOutput() {
  let status = true;
  if (!midiOutput) {
    status = false;
    console.error(
      "%c[SetList]%c MIDI output not selected",
      "color: white; background: #d32f2f; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
      "color: #d32f2f; font-weight: bold;"
    );
  }
  return status;
}

function updateMidiIndicators() {
  function checkMidi() {
    console.log('Check midi access');
    syncMidiModalButtonVisibility();

    const midiSpans = document.querySelectorAll('span.midi');
    midiSpans.forEach(span => {
      span.classList.toggle('error', !midiOutput);
    });

    const greenPads = document.querySelectorAll('span.square-green-button');
    greenPads.forEach(span => {
      span.classList.toggle('dimmed', !midiOutput);
    });

    document.querySelectorAll('.square-gray-button').forEach(el => {
      el.classList.toggle('dimmed', !midiOutput);
    });
  }

  // Первый вызов через 3 секунды (вызывается из music.js на DOMContentLoaded)
  setTimeout(() => {
    checkMidi();
    setInterval(checkMidi, 30000);
  }, 3000);
}

function initMidiModal() {
  const modal = document.getElementById('midi-modal');
  const trigger = document.getElementById('midiModalBtn');
  const closeBtn = document.getElementById('midiModalClose');
  const sendBtn = document.getElementById('midiModalSend');
  const deviceNameEl = document.getElementById('midiModalDeviceName');

  if (!modal || !trigger) return;

  function openMidiModal() {
    if (deviceNameEl && midiOutput) {
      deviceNameEl.textContent = 'Устройство: ' + midiOutput.name;
    } else if (deviceNameEl) {
      deviceNameEl.textContent = 'Устройство не выбрано';
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeMidiModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  trigger.addEventListener('click', openMidiModal);
  if (closeBtn) closeBtn.addEventListener('click', closeMidiModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeMidiModal();
  });

  if (sendBtn) {
    sendBtn.addEventListener('click', function () {
      if (!selectedMidiOutput()) return;
      const ch = parseInt(document.getElementById('midiModalChannel').value, 10);
      const msb = parseInt(document.getElementById('midiModalMsb').value, 10);
      const lsb = parseInt(document.getElementById('midiModalLsb').value, 10);
      const prog = parseInt(document.getElementById('midiModalProgram').value, 10);
      if (isNaN(ch) || ch < 1 || ch > 16) return;
      if ([msb, lsb, prog].some(v => isNaN(v) || v < 0 || v > 127)) return;
      sendMidiPatch(ch - 1, msb, lsb, prog, '');
    });
  }

  const sysexInput = document.getElementById('midiModalSysex');
  const sendSysexBtn = document.getElementById('midiModalSendSysex');
  if (sendSysexBtn && sysexInput) {
    sendSysexBtn.addEventListener('click', function () {
      if (!selectedMidiOutput()) return;
      const raw = sysexInput.value.trim().replace(/,/g, ' ').split(/\s+/).filter(Boolean);
      const dataArray = [];
      for (let i = 0; i < raw.length; i++) {
        const s = raw[i].replace(/^0x/i, '');
        const n = parseInt(s, 16);
        if (isNaN(n) || n < 0 || n > 255) continue;
        dataArray.push(n);
      }
      if (dataArray.length < 3) {
        console.warn('SysEx: нужно минимум 3 байта');
        return;
      }
      sendSysEx(dataArray.slice(), 'Modal');
    });
  }
}
