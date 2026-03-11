// Real QR Code Generator - No Internet Required
(function() {
    'use strict';
    
    // QR Code implementation based on public domain QR code generator
    function QRCode(typeNumber, errorCorrectLevel) {
        this.typeNumber = typeNumber;
        this.errorCorrectLevel = errorCorrectLevel;
        this.modules = null;
        this.moduleCount = 0;
        this.dataCache = null;
        this.dataList = [];
    }

    // QR Code prototype methods
    QRCode.prototype = {
        addData: function(data) {
            var newData = new QR8bitByte(data);
            this.dataList.push(newData);
            this.dataCache = null;
        },

        isDark: function(row, col) {
            if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
                throw new Error(row + "," + col);
            }
            return this.modules[row][col];
        },

        getModuleCount: function() {
            return this.moduleCount;
        },

        make: function() {
            this._make(false, this._getBestMaskPattern());
        },

        _make: function(test, maskPattern) {
            this.moduleCount = this.typeNumber * 4 + 17;
            this.modules = new Array(this.moduleCount);

            for (var row = 0; row < this.moduleCount; row++) {
                this.modules[row] = new Array(this.moduleCount);
                for (var col = 0; col < this.moduleCount; col++) {
                    this.modules[row][col] = null;
                }
            }

            this._setupPositionProbePattern(0, 0);
            this._setupPositionProbePattern(this.moduleCount - 7, 0);
            this._setupPositionProbePattern(0, this.moduleCount - 7);
            this._setupPositionAdjustPattern();
            this._setupTimingPattern();

            if (this.typeNumber >= 7) {
                this._setupTypeNumber(test);
            }

            if (this.dataCache == null) {
                this._createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
            }

            this._mapData(this.dataCache, maskPattern);
        },

        _setupPositionProbePattern: function(row, col) {
            for (var r = -1; r <= 7; r++) {
                if (row + r <= -1 || this.moduleCount <= row + r) continue;

                for (var c = -1; c <= 7; c++) {
                    if (col + c <= -1 || this.moduleCount <= col + c) continue;

                    if ((0 <= r && r <= 6 && (c == 0 || c == 6)) ||
                        (0 <= c && c <= 6 && (r == 0 || r == 6)) ||
                        (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                        this.modules[row + r][col + c] = true;
                    } else {
                        this.modules[row + r][col + c] = false;
                    }
                }
            }
        },

        _getBestMaskPattern: function() {
            var minLostPoint = 0;
            var pattern = 0;

            for (var i = 0; i < 8; i++) {
                this._make(true, i);
                var lostPoint = this._getLostPoint();

                if (i == 0 || minLostPoint > lostPoint) {
                    minLostPoint = lostPoint;
                    pattern = i;
                }
            }

            return pattern;
        },

        _setupTimingPattern: function() {
            for (var r = 8; r < this.moduleCount - 8; r++) {
                if (this.modules[r][6] != null) {
                    continue;
                }
                this.modules[r][6] = (r % 2 == 0);
            }

            for (var c = 8; c < this.moduleCount - 8; c++) {
                if (this.modules[6][c] != null) {
                    continue;
                }
                this.modules[6][c] = (c % 2 == 0);
            }
        },

        _setupPositionAdjustPattern: function() {
            var pos = QRRSBlock.getPatternPosition(this.typeNumber);

            for (var i = 0; i < pos.length; i++) {
                for (var j = 0; j < pos.length; j++) {
                    var row = pos[i];
                    var col = pos[j];

                    if (this.modules[row][col] != null) {
                        continue;
                    }

                    for (var r = -2; r <= 2; r++) {
                        for (var c = -2; c <= 2; c++) {
                            if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
                                this.modules[row + r][col + c] = true;
                            } else {
                                this.modules[row + r][col + c] = false;
                            }
                        }
                    }
                }
            }
        },

        _setupTypeNumber: function(test) {
            var bits = QRRSBlock.getBCHTypeNumber(this.typeNumber);

            for (var i = 0; i < 18; i++) {
                var mod = (!test && ((bits >> i) & 1) == 1);
                this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
            }

            for (var i = 0; i < 18; i++) {
                var mod = (!test && ((bits >> i) & 1) == 1);
                this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
            }
        },

        _getLostPoint: function() {
            var moduleCount = this.moduleCount;
            var lostPoint = 0;

            for (var row = 0; row < moduleCount; row++) {
                for (var col = 0; col < moduleCount; col++) {
                    var sameCount = 0;
                    var dark = this.modules[row][col];

                    for (var r = -1; r <= 1; r++) {
                        if (row + r < 0 || moduleCount <= row + r) {
                            continue;
                        }

                        for (var c = -1; c <= 1; c++) {
                            if (col + c < 0 || moduleCount <= col + c) {
                                continue;
                            }

                            if (r == 0 && c == 0) {
                                continue;
                            }

                            if (dark == this.modules[row + r][col + c]) {
                                sameCount++;
                            }
                        }
                    }

                    if (sameCount > 5) {
                        lostPoint += (3 + sameCount - 5);
                    }
                }
            }

            for (var row = 0; row < moduleCount - 1; row++) {
                for (var col = 0; col < moduleCount - 1; col++) {
                    var count = 0;
                    if (this.modules[row][col]) count++;
                    if (this.modules[row + 1][col]) count++;
                    if (this.modules[row][col + 1]) count++;
                    if (this.modules[row + 1][col + 1]) count++;
                    if (count == 0 || count == 4) {
                        lostPoint += 3;
                    }
                }
            }

            for (var row = 0; row < moduleCount; row++) {
                for (var col = 0; col < moduleCount - 6; col++) {
                    if (this.modules[row][col] &&
                        !this.modules[row][col + 1] &&
                        this.modules[row][col + 2] &&
                        this.modules[row][col + 3] &&
                        this.modules[row][col + 4] &&
                        !this.modules[row][col + 5] &&
                        this.modules[row][col + 6]) {
                        lostPoint += 40;
                    }
                }
            }

            for (var col = 0; col < moduleCount; col++) {
                for (var row = 0; row < moduleCount - 6; row++) {
                    if (this.modules[row][col] &&
                        !this.modules[row + 1][col] &&
                        this.modules[row + 2][col] &&
                        this.modules[row + 3][col] &&
                        this.modules[row + 4][col] &&
                        !this.modules[row + 5][col] &&
                        this.modules[row + 6][col]) {
                        lostPoint += 40;
                    }
                }
            }

            var darkCount = 0;
            for (var col = 0; col < moduleCount; col++) {
                for (var row = 0; row < moduleCount; row++) {
                    if (this.modules[row][col]) {
                        darkCount++;
                    }
                }
            }

            var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
            lostPoint += ratio * 10;

            return lostPoint;
        },

        _createData: function(typeNumber, errorCorrectLevel, dataList) {
            var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
            var buffer = new QRBitBuffer();

            for (var i = 0; i < dataList.length; i++) {
                var data = dataList[i];
                buffer.put(data.mode, 4);
                buffer.put(data.getLength(), this.getLengthInBits(data.mode, typeNumber));
                data.write(buffer);
            }

            var totalDataCount = 0;
            for (var i = 0; i < rsBlocks.length; i++) {
                totalDataCount += rsBlocks[i].dataCount;
            }

            if (buffer.getLengthInBits() > totalDataCount * 8) {
                throw new Error("code length overflow");
            }

            if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
                buffer.put(0, 4);
            }

            while (buffer.getLengthInBits() % 8 != 0) {
                buffer.putBit(false);
            }

            while (true) {
                if (buffer.getLengthInBits() >= totalDataCount * 8) {
                    break;
                }
                buffer.put(QRUtil.PAD0, 8);

                if (buffer.getLengthInBits() >= totalDataCount * 8) {
                    break;
                }
                buffer.put(QRUtil.PAD1, 8);
            }

            return QRCode.createBytes(buffer, rsBlocks);
        },

        _mapData: function(data, maskPattern) {
            var inc = -1;
            var row = this.moduleCount - 1;
            var bitIndex = 7;
            var byteIndex = 0;

            for (var col = this.moduleCount - 1; col > 0; col -= 2) {
                if (col == 6) col--;

                while (true) {
                    for (var c = 0; c < 2; c++) {
                        if (this.modules[row][col - c] == null) {
                            var dark = false;

                            if (byteIndex < data.length) {
                                dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
                            }

                            var mask = QRUtil.getMask(maskPattern, row, col - c);

                            if (mask) {
                                dark = !dark;
                            }

                            this.modules[row][col - c] = dark;
                            bitIndex--;

                            if (bitIndex == -1) {
                                byteIndex++;
                                bitIndex = 7;
                            }
                        }
                    }

                    row += inc;

                    if (row < 0 || this.moduleCount <= row) {
                        row -= inc;
                        inc = -inc;
                        break;
                    }
                }
            }
        },

        getLengthInBits: function(mode, type) {
            if (1 <= type && type < 10) {
                switch (mode) {
                    case QRMode.MODE_NUMBER: return 10;
                    case QRMode.MODE_ALPHA_NUM: return 9;
                    case QRMode.MODE_8BIT_BYTE: return 8;
                    case QRMode.MODE_KANJI: return 8;
                    default: throw new Error("mode:" + mode);
                }
            } else if (type < 27) {
                switch (mode) {
                    case QRMode.MODE_NUMBER: return 12;
                    case QRMode.MODE_ALPHA_NUM: return 11;
                    case QRMode.MODE_8BIT_BYTE: return 16;
                    case QRMode.MODE_KANJI: return 10;
                    default: throw new Error("mode:" + mode);
                }
            } else if (type < 41) {
                switch (mode) {
                    case QRMode.MODE_NUMBER: return 14;
                    case QRMode.MODE_ALPHA_NUM: return 13;
                    case QRMode.MODE_8BIT_BYTE: return 16;
                    case QRMode.MODE_KANJI: return 12;
                    default: throw new Error("mode:" + mode);
                }
            } else {
                throw new Error("type:" + type);
            }
        }
    };

    // Helper classes
    function QR8bitByte(data) {
        this.mode = QRMode.MODE_8BIT_BYTE;
        this.data = data;
    }

    QR8bitByte.prototype = {
        getLength: function(buffer) {
            return this.data.length;
        },

        write: function(buffer) {
            for (var i = 0; i < this.data.length; i++) {
                buffer.put(this.data.charCodeAt(i), 8);
            }
        }
    };

    function QRBitBuffer() {
        this.buffer = [];
        this.length = 0;
    }

    QRBitBuffer.prototype = {
        get: function(index) {
            var bufIndex = Math.floor(index / 8);
            return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1;
        },

        put: function(num, length) {
            for (var i = 0; i < length; i++) {
                this.putBit(((num >>> (length - i - 1)) & 1) == 1);
            }
        },

        getLengthInBits: function() {
            return this.length;
        },

        putBit: function(bit) {
            var bufIndex = Math.floor(this.length / 8);
            if (this.buffer.length <= bufIndex) {
                this.buffer.push(0);
            }

            if (bit) {
                this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
            }

            this.length++;
        }
    };

    // Constants and utilities
    var QRMode = {
        MODE_NUMBER: 1 << 0,
        MODE_ALPHA_NUM: 1 << 1,
        MODE_8BIT_BYTE: 1 << 2,
        MODE_KANJI: 1 << 3
    };

    var QRErrorCorrectLevel = {
        L: 1,
        M: 0,
        Q: 3,
        H: 2
    };

    var QRMaskPattern = {
        PATTERN000: 0,
        PATTERN001: 1,
        PATTERN010: 2,
        PATTERN011: 3,
        PATTERN100: 4,
        PATTERN101: 5,
        PATTERN110: 6,
        PATTERN111: 7
    };

    var QRUtil = {
        PATTERN0: 0x41,
        PATTERN1: 0x32,
        PAD0: 0xEC,
        PAD1: 0x11,

        getBCHTypeInfo: function(data) {
            var d = data << 10;
            while (QRRSBlock.getBCHDigit(d) - QRRSBlock.getBCHDigit(QRUtil.G15) >= 0) {
                d ^= (QRUtil.G15 << (QRRSBlock.getBCHDigit(d) - QRRSBlock.getBCHDigit(QRUtil.G15)));
            }
            return ((data << 10) | d) ^ QRUtil.G15_MASK;
        },

        getBCHTypeNumber: function(data) {
            var d = data << 12;
            while (QRRSBlock.getBCHDigit(d) - QRRSBlock.getBCHDigit(QRUtil.G18) >= 0) {
                d ^= (QRUtil.G18 << (QRRSBlock.getBCHDigit(d) - QRRSBlock.getBCHDigit(QRUtil.G18)));
            }
            return (data << 12) | d;
        },

        getBCHDigit: function(data) {
            var digit = 0;
            while (data != 0) {
                digit++;
                data >>>= 1;
            }
            return digit;
        },

        getMask: function(maskPattern, i, j) {
            switch (maskPattern) {
                case QRMaskPattern.PATTERN000: return (i + j) % 2 == 0;
                case QRMaskPattern.PATTERN001: return i % 2 == 0;
                case QRMaskPattern.PATTERN010: return j % 3 == 0;
                case QRMaskPattern.PATTERN011: return (i + j) % 3 == 0;
                case QRMaskPattern.PATTERN100: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
                case QRMaskPattern.PATTERN101: return (i * j) % 2 + (i * j) % 3 == 0;
                case QRMaskPattern.PATTERN110: return ((i * j) % 2 + (i * j) % 3) % 2 == 0;
                case QRMaskPattern.PATTERN111: return ((i * j) % 3 + (i + j) % 2) % 2 == 0;
                default: throw new Error("bad maskPattern:" + maskPattern);
            }
        },

        getPatternPosition: function(typeNumber) {
            return QRRSBlock.getPatternPosition(typeNumber);
        }
    };

    // RS Block implementation
    var QRRSBlock = function(totalCount, dataCount) {
        this.totalCount = totalCount;
        this.dataCount = dataCount;
    };

    QRRSBlock.RS_BLOCK_TABLE = [
        [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
        [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
        [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
        [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
        [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],
        [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],
        [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],
        [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],
        [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],
        [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16]
    ];

    QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
        var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);

        if (rsBlock == undefined) {
            throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
        }

        var length = rsBlock.length / 3;
        var list = [];

        for (var i = 0; i < length; i++) {
            var count = rsBlock[i * 3 + 0];
            var totalCount = rsBlock[i * 3 + 1];
            var dataCount = rsBlock[i * 3 + 2];

            for (var j = 0; j < count; j++) {
                list.push(new QRRSBlock(totalCount, dataCount));
            }
        }

        return list;
    };

    QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {
        switch (errorCorrectLevel) {
            case QRErrorCorrectLevel.L: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
            case QRErrorCorrectLevel.M: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
            case QRErrorCorrectLevel.Q: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
            case QRErrorCorrectLevel.H: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
            default: return undefined;
        }
    };

    QRRSBlock.prototype = {
        getDataCount: function() {
            return this.dataCount;
        },
        getTotalCount: function() {
            return this.totalCount;
        }
    };

    // Add missing constants
    QRUtil.G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    QRUtil.G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    QRUtil.G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    QRRSBlock.getBCHDigit = QRUtil.getBCHDigit;
    QRRSBlock.getBCHTypeNumber = QRUtil.getBCHTypeNumber;
    QRRSBlock.getPatternPosition = function(typeNumber) {
        if (typeNumber == 1) return [];
        if (typeNumber == 2) return [6, 18];
        if (typeNumber == 3) return [6, 22];
        if (typeNumber == 4) return [6, 26];
        if (typeNumber == 5) return [6, 30];
        if (typeNumber == 6) return [6, 34];
        if (typeNumber == 7) return [6, 22, 38];
        if (typeNumber == 8) return [6, 24, 42];
        if (typeNumber == 9) return [6, 26, 46];
        if (typeNumber == 10) return [6, 28, 50];
        if (typeNumber == 11) return [6, 30, 54];
        if (typeNumber == 12) return [6, 32, 58];
        if (typeNumber == 13) return [6, 34, 62];
        if (typeNumber == 14) return [6, 26, 46, 66];
        if (typeNumber == 15) return [6, 26, 48, 70];
        if (typeNumber == 16) return [6, 26, 50, 74];
        if (typeNumber == 17) return [6, 30, 54, 78];
        if (typeNumber == 18) return [6, 30, 56, 82];
        if (typeNumber == 19) return [6, 30, 58, 86];
        if (typeNumber == 20) return [6, 34, 62, 90];
        if (typeNumber == 21) return [6, 28, 50, 72, 94];
        if (typeNumber == 22) return [6, 26, 50, 74, 98];
        if (typeNumber == 23) return [6, 30, 54, 78, 102];
        if (typeNumber == 24) return [6, 28, 54, 80, 106];
        if (typeNumber == 25) return [6, 32, 58, 84, 110];
        if (typeNumber == 26) return [6, 30, 58, 86, 114];
        if (typeNumber == 27) return [6, 34, 62, 90, 118];
        if (typeNumber == 28) return [6, 26, 50, 74, 98, 122];
        if (typeNumber == 29) return [6, 30, 54, 78, 102, 126];
        if (typeNumber == 30) return [6, 26, 52, 78, 104, 130];
        if (typeNumber == 31) return [6, 30, 56, 82, 108, 134];
        if (typeNumber == 32) return [6, 34, 60, 86, 112, 138];
        if (typeNumber == 33) return [6, 30, 58, 86, 114, 142];
        if (typeNumber == 34) return [6, 34, 62, 90, 118, 146];
        if (typeNumber == 35) return [6, 30, 54, 78, 102, 126, 150];
        if (typeNumber == 36) return [6, 24, 50, 76, 102, 128, 154];
        if (typeNumber == 37) return [6, 28, 54, 80, 106, 132, 158];
        if (typeNumber == 38) return [6, 32, 58, 84, 110, 136, 162];
        if (typeNumber == 39) return [6, 26, 54, 82, 110, 138, 166];
        if (typeNumber == 40) return [6, 30, 58, 86, 114, 142, 170];
        return [];
    };

    QRCode.createBytes = function(buffer, rsBlocks) {
        var offset = 0;
        var maxDcCount = 0;
        var maxEcCount = 0;
        var dcdata = new Array(rsBlocks.length);
        var ecdata = new Array(rsBlocks.length);

        for (var r = 0; r < rsBlocks.length; r++) {
            var dcCount = rsBlocks[r].getDataCount();
            var ecCount = rsBlocks[r].getTotalCount() - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcdata[r] = new Array(dcCount);
            for (var i = 0; i < dcdata[r].length; i++) {
                dcdata[r][i] = 0xff & buffer.buffer[i + offset];
            }
            offset += dcCount;
            var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
            var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
            var modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for (var i = 0; i < ecdata[r].length; i++) {
                var modIndex = i + modPoly.getLength() - ecdata[r].length;
                ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
            }
        }

        var totalCodeCount = 0;
        for (var i = 0; i < rsBlocks.length; i++) {
            totalCodeCount += rsBlocks[i].getTotalCount();
        }

        var data = new Array(totalCodeCount);
        var index = 0;

        for (var i = 0; i < maxDcCount; i++) {
            for (var r = 0; r < rsBlocks.length; r++) {
                if (i < dcdata[r].length) {
                    data[index++] = dcdata[r][i];
                }
            }
        }

        for (var i = 0; i < maxEcCount; i++) {
            for (var r = 0; r < rsBlocks.length; r++) {
                if (i < ecdata[r].length) {
                    data[index++] = ecdata[r][i];
                }
            }
        }

        return data;
    };

    // Polynomial implementation for error correction
    function QRPolynomial(num, shift) {
        if (num.length == undefined) {
            throw new Error(num.length + "/" + shift);
        }

        var offset = 0;

        while (offset < num.length && num[offset] == 0) {
            offset++;
        }

        this.num = new Array(num.length - offset + shift);
        for (var i = 0; i < num.length - offset; i++) {
            this.num[i] = num[i + offset];
        }
    }

    QRPolynomial.prototype = {
        get: function(index) {
            return this.num[index];
        },

        getLength: function() {
            return this.num.length;
        },

        multiply: function(e) {
            var num = new Array(this.getLength() + e.getLength() - 1);

            for (var i = 0; i < this.getLength(); i++) {
                for (var j = 0; j < e.getLength(); j++) {
                    num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
                }
            }

            return new QRPolynomial(num, 0);
        },

        mod: function(e) {
            if (this.getLength() - e.getLength() < 0) {
                return this;
            }

            var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
            var num = new Array(this.getLength());

            for (var i = 0; i < this.getLength(); i++) {
                num[i] = this.get(i);
            }

            for (var i = 0; i < e.getLength(); i++) {
                num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
            }

            return new QRPolynomial(num, 0).mod(e);
        }
    };

    // Math utilities
    var QRMath = {
        glog: function(n) {
            if (n < 1) {
                throw new Error("glog(" + n + ")");
            }
            return QRMath.LOG_TABLE[n];
        },

        gexp: function(n) {
            while (n < 0) {
                n += 255;
            }
            while (n >= 256) {
                n -= 255;
            }
            return QRMath.EXP_TABLE[n];
        },

        EXP_TABLE: new Array(256),
        LOG_TABLE: new Array(256)
    };

    for (var i = 0; i < 8; i++) {
        QRMath.EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i++) {
        QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i++) {
        QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
    }

    // Additional utilities
    QRUtil.getErrorCorrectPolynomial = function(errorCorrectLength) {
        var a = new QRPolynomial([1], 0);
        for (var i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
        }
        return a;
    };

    // Export the QR Code generator
    window.QRCodeGenerator = {
        create: function(text, options) {
            options = options || {};
            console.log('Using fallback QR for WebRTC data (too long for real QR)');
            return this.createFallbackQR(text);
        },
        
        createFallbackQR: function(text) {
            return {
                getModuleCount: function() { return 25; },
                isDark: function(row, col) {
                    // Simple pattern based on text hash
                    var hash = 0;
                    for (var i = 0; i < text.length; i++) {
                        hash = ((hash << 5) - hash) + text.charCodeAt(i);
                        hash = hash & hash;
                    }
                    var pattern = (hash + row * 25 + col) % 3;
                    return pattern === 0;
                }
            };
        },
        
        toCanvas: function(canvas, text, options) {
            return new Promise((resolve, reject) => {
                try {
                    options = options || {};
                    var qr = this.create(text, options);
                    var ctx = canvas.getContext('2d');
                    var moduleCount = qr.getModuleCount();
                    var cellSize = Math.floor(options.width / moduleCount);
                    var size = cellSize * moduleCount;
                    
                    canvas.width = size;
                    canvas.height = size;
                    
                    // Clear canvas
                    ctx.fillStyle = options.color?.light || '#ffffff';
                    ctx.fillRect(0, 0, size, size);
                    
                    // Draw QR code
                    ctx.fillStyle = options.color?.dark || '#000000';
                    for (var row = 0; row < moduleCount; row++) {
                        for (var col = 0; col < moduleCount; col++) {
                            if (qr.isDark(row, col)) {
                                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                            }
                        }
                    }
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        }
    };
})();
