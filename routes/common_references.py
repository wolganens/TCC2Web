import sys
from Levenshtein import ratio

references = sys.argv[1:]
separator_index = references.index('$SEPARADOR$')
p1_references = references[:separator_index]
p2_references = references[separator_index:]

for ref_p1 in p1_references:
	for ref_p2 in p2_references:
		if ratio(ref_p1, ref_p2) >= 0.75:
			print(ref_p1)
