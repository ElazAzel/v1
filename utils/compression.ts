// This is a simplified and compact implementation of an LZW-based compression algorithm
// designed to be self-contained and produce URL-safe Base64 strings, inspired by lz-string.

const keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

export const compressToBase64 = (input: string | null): string => {
  if (input == null) return "";
  let output = "";
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  let i = 0;

  const compressed = compress(input);

  while (i < compressed.length * 2) {
    if (i % 2 === 0) {
      chr1 = compressed.charCodeAt(i / 2) >> 8;
      chr2 = compressed.charCodeAt(i / 2) & 255;
      if (i / 2 + 1 < compressed.length) {
        chr3 = compressed.charCodeAt(i / 2 + 1) >> 8;
      } else {
        chr3 = NaN;
      }
    } else {
      chr1 = compressed.charCodeAt((i - 1) / 2) & 255;
      if ((i + 1) / 2 < compressed.length) {
        chr2 = compressed.charCodeAt((i + 1) / 2) >> 8;
        chr3 = compressed.charCodeAt((i + 1) / 2) & 255;
      } else {
        chr2 = chr3 = NaN;
      }
    }
    i += 3;

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }

    output =
      output +
      keyStrBase64.charAt(enc1) +
      keyStrBase64.charAt(enc2) +
      keyStrBase64.charAt(enc3) +
      keyStrBase64.charAt(enc4);
  }

  return output;
};


export const decompressFromBase64 = (input: string | null): string | null => {
    if (input == null) return "";
    if (input === "") return null;
  
    input = input.replace(/ /g, "+");
  
    let output = "",
      ol = 0,
      output_ = [],
      chr1,
      chr2,
      chr3,
      enc1,
      enc2,
      enc3,
      enc4,
      i = 0;
  
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  
    while (i < input.length) {
      enc1 = keyStrBase64.indexOf(input.charAt(i++));
      enc2 = keyStrBase64.indexOf(input.charAt(i++));
      enc3 = keyStrBase64.indexOf(input.charAt(i++));
      enc4 = keyStrBase64.indexOf(input.charAt(i++));
  
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
  
      if (ol % 2 === 0) {
        output_ [ol >> 1] = (chr1 << 8);
        if (enc3 !== 64) {
            output_ [ol >> 1] |= chr2;
        }
      } else {
        output_ [ (ol - 1) >> 1] |= chr1;
      }
      ol += 2;
      if (enc4 !== 64) {
        if (ol % 2 === 0) {
            output_ [ol >> 1] = (chr2 << 8);
            if (enc4 !== 64) {
              output_ [ol >> 1] |= chr3;
            }
        } else {
            output_ [ (ol - 1) >> 1] |= chr2;
        }
        ol += 2;
      }
    }

    for (let i = 0; i < ol/2; i++) {
        output += String.fromCharCode(output_[i]);
    }
  
    return decompress(output);
  };
  

const compress = (uncompressed: string): string => {
  if (uncompressed == null) return "";
  let i, value,
    context_dictionary = {},
    context_dictionaryToCreate = {},
    context_c = "",
    context_wc = "",
    context_w = "",
    context_enlargeIn = 2, 
    context_dictSize = 3,
    context_numBits = 2,
    context_data_string = "",
    context_data_val = 0,
    context_data_position = 0;

  const getNextValue = (index: number) => uncompressed.charCodeAt(index);

  for (let ii = 0; ii < uncompressed.length; ii += 1) {
    context_c = uncompressed.charAt(ii);
    if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
      context_dictionary[context_c] = context_dictSize++;
      context_dictionaryToCreate[context_c] = true;
    }

    context_wc = context_w + context_c;
    if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
      context_w = context_wc;
    } else {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        if (context_w.charCodeAt(0) < 256) {
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i = 0; i < 8; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i = 0; i < 16; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | (value & 1);
          if (context_data_position == 15) {
            context_data_position = 0;
            context_data_string += String.fromCharCode(context_data_val);
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }
      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
      context_dictionary[context_wc] = context_dictSize++;
      context_w = String(context_c);
    }
  }

  if (context_w !== "") {
    if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
      if (context_w.charCodeAt(0) < 256) {
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1);
          if (context_data_position == 15) {
            context_data_position = 0;
            context_data_string += String.fromCharCode(context_data_val);
            context_data_val = 0;
          } else {
            context_data_position++;
          }
        }
        value = context_w.charCodeAt(0);
        for (i = 0; i < 8; i++) {
          context_data_val = (context_data_val << 1) | (value & 1);
          if (context_data_position == 15) {
            context_data_position = 0;
            context_data_string += String.fromCharCode(context_data_val);
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }
      } else {
        value = 1;
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | value;
          if (context_data_position == 15) {
            context_data_position = 0;
            context_data_string += String.fromCharCode(context_data_val);
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = 0;
        }
        value = context_w.charCodeAt(0);
        for (i = 0; i < 16; i++) {
          context_data_val = (context_data_val << 1) | (value & 1);
          if (context_data_position == 15) {
            context_data_position = 0;
            context_data_string += String.fromCharCode(context_data_val);
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }
      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
      delete context_dictionaryToCreate[context_w];
    } else {
      value = context_dictionary[context_w];
      for (i = 0; i < context_numBits; i++) {
        context_data_val = (context_data_val << 1) | (value & 1);
        if (context_data_position == 15) {
          context_data_position = 0;
          context_data_string += String.fromCharCode(context_data_val);
          context_data_val = 0;
        } else {
          context_data_position++;
        }
        value = value >> 1;
      }
    }
    context_enlargeIn--;
    if (context_enlargeIn == 0) {
      context_enlargeIn = Math.pow(2, context_numBits);
      context_numBits++;
    }
  }

  value = 2;
  for (i = 0; i < context_numBits; i++) {
    context_data_val = (context_data_val << 1) | (value & 1);
    if (context_data_position == 15) {
      context_data_position = 0;
      context_data_string += String.fromCharCode(context_data_val);
      context_data_val = 0;
    } else {
      context_data_position++;
    }
    value = value >> 1;
  }

  while (true) {
    context_data_val = (context_data_val << 1);
    if (context_data_position == 15) {
      context_data_string += String.fromCharCode(context_data_val);
      break;
    }
    else context_data_position++;
  }
  return context_data_string;
}

const decompress = (compressed: string | null): string => {
    if (compressed == null) return "";
    if (compressed === "") return null;
  
    const dictionary = [];
    let enlargeIn = 4,
      dictSize = 4,
      numBits = 3,
      entry = "",
      result = "",
      w,
      bits,
      resb,
      maxpower,
      power,
      c,
      data = {
        string: compressed,
        val: compressed.charCodeAt(0),
        position: 32768,
        index: 1,
      };
  
    for (let i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }
  
    bits = 0;
    maxpower = Math.pow(2, 2);
    power = 1;
    while (power !== maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = 32768;
        data.val = data.string.charCodeAt(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }
  
    switch (bits) {
      case 0:
        bits = 0;
        maxpower = Math.pow(2, 8);
        power = 1;
        while (power !== maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = 32768;
            data.val = data.string.charCodeAt(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        c = String.fromCharCode(bits);
        break;
      case 1:
        bits = 0;
        maxpower = Math.pow(2, 16);
        power = 1;
        while (power !== maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = 32768;
            data.val = data.string.charCodeAt(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        c = String.fromCharCode(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    w = result = c;
    while (true) {
      if (data.index > data.string.length) {
        return "";
      }
  
      bits = 0;
      maxpower = Math.pow(2, numBits);
      power = 1;
      while (power !== maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = 32768;
          data.val = data.string.charCodeAt(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
  
      let c2 = bits;
      switch (c2) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2, 8);
          power = 1;
          while (power !== maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position === 0) {
              data.position = 32768;
              data.val = data.string.charCodeAt(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = String.fromCharCode(bits);
          c2 = dictSize - 1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2, 16);
          power = 1;
          while (power !== maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position === 0) {
              data.position = 32768;
              data.val = data.string.charCodeAt(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = String.fromCharCode(bits);
          c2 = dictSize - 1;
          enlargeIn--;
          break;
        case 2:
          return result;
      }
  
      if (enlargeIn === 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
  
      if (dictionary[c2]) {
        entry = dictionary[c2];
      } else {
        if (c2 === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result += entry;
  
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;
  
      w = entry;
  
      if (enlargeIn === 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
    }
  };
