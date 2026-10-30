"""Converts the glyphs of a TrueType font into a Three.js typeface.json.

Usage: python3 scripts/build-typeface.py FONT.ttf "text to cover" [WEIGHT=900] > OUT.typeface.json
Only the characters in the text are emitted, so the hero's font stays a few KB.
A variable font is pinned to WEIGHT before its outlines are read, which is how
Inter becomes the hero's steel: one static instance, baked at build time.
"""
import json
import sys

from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


class TypefacePen(BasePen):
    def __init__(self, glyph_set):
        super().__init__(glyph_set)
        self.commands = []

    def _moveTo(self, pt):
        self.commands.append(f"m {round(pt[0])} {round(pt[1])}")

    def _lineTo(self, pt):
        self.commands.append(f"l {round(pt[0])} {round(pt[1])}")

    def _qCurveToOne(self, pt1, pt2):
        # Three reads a quadratic as: end point first, then the control point.
        self.commands.append(f"q {round(pt2[0])} {round(pt2[1])} {round(pt1[0])} {round(pt1[1])}")

    def _curveToOne(self, pt1, pt2, pt3):
        self.commands.append(
            f"b {round(pt3[0])} {round(pt3[1])} {round(pt1[0])} {round(pt1[1])} {round(pt2[0])} {round(pt2[1])}"
        )

    def _closePath(self):
        pass


def pin_weight(font, weight):
    """Collapses a variable font to one static instance; a static font is returned as-is."""
    if "fvar" not in font:
        return font
    return instantiateVariableFont(font, {"wght": weight}, inplace=False, updateFontNames=True)


def main(path, text, weight=None):
    font = TTFont(path)
    if weight is not None:
        font = pin_weight(font, weight)
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    glyphs = {}
    for char in sorted(set(text)):
        name = cmap[ord(char)]
        pen = TypefacePen(glyph_set)
        glyph_set[name].draw(pen)
        advance, left = hmtx[name]
        glyphs[char] = {
            "ha": advance,
            "x_min": left,
            "x_max": advance,
            "o": " ".join(pen.commands),
        }
    head, hhea = font["head"], font["hhea"]
    typeface = {
        "glyphs": glyphs,
        "familyName": font["name"].getDebugName(1),
        "ascender": hhea.ascent,
        "descender": hhea.descent,
        "underlinePosition": font["post"].underlinePosition,
        "underlineThickness": font["post"].underlineThickness,
        "boundingBox": {"yMin": head.yMin, "xMin": head.xMin, "yMax": head.yMax, "xMax": head.xMax},
        "resolution": head.unitsPerEm,
        "original_font_information": {},
    }
    json.dump(typeface, sys.stdout, separators=(",", ":"))


main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else None)
