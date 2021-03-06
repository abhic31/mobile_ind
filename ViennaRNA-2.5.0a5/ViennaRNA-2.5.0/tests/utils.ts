#include <stdlib.h>
#include <string.h>

#include <ViennaRNA/model.h>
#include <ViennaRNA/utils/basic.h>
#include <ViennaRNA/utils/strings.h>
#include <ViennaRNA/alphabet.h>
#include <ViennaRNA/mfe.h>

static int
compare_str(const void  *a,
            const void  *b)
{
  return strcmp(*((const char **)a), *((const char **)b));
}

#suite Utilities

#tcase Sequence_Utils

#test test_vrna_nucleotide_encode
{
  vrna_md_t details = {
    0
  };

  ck_assert_int_eq(vrna_nucleotide_encode('\0', &details), 0);
  ck_assert_int_eq(vrna_nucleotide_encode('_', &details), 0);
  ck_assert_int_eq(vrna_nucleotide_encode('A', &details), 1);
  ck_assert_int_eq(vrna_nucleotide_encode('C', &details), 2);
  ck_assert_int_eq(vrna_nucleotide_encode('G', &details), 3);
  ck_assert_int_eq(vrna_nucleotide_encode('U', &details), 4);
  ck_assert_int_eq(vrna_nucleotide_encode('T', &details), 4);
  ck_assert_int_eq(vrna_nucleotide_encode('X', &details), 0);
  ck_assert_int_eq(vrna_nucleotide_encode('K', &details), 0);
  ck_assert_int_eq(vrna_nucleotide_encode('I', &details), 0);

  details.energy_set = 1;

  ck_assert_int_eq(vrna_nucleotide_encode('\0', &details), -64);
  ck_assert_int_eq(vrna_nucleotide_encode('_', &details), 31);
  ck_assert_int_eq(vrna_nucleotide_encode('A', &details), 1);
  ck_assert_int_eq(vrna_nucleotide_encode('C', &details), 3);
  ck_assert_int_eq(vrna_nucleotide_encode('G', &details), 7);
  ck_assert_int_eq(vrna_nucleotide_encode('U', &details), 21);
  ck_assert_int_eq(vrna_nucleotide_encode('T', &details), 20);
  ck_assert_int_eq(vrna_nucleotide_encode('X', &details), 24);
  ck_assert_int_eq(vrna_nucleotide_encode('K', &details), 11);
  ck_assert_int_eq(vrna_nucleotide_encode('I', &details), 9);
}

#test test_vrna_nucleotide_decode
{
  const char  *characters = "_ACGUTXKI";
  const char  *p;
  vrna_md_t   details = {
    0
  };

  ck_assert_int_eq(vrna_nucleotide_decode(0, &details), '_');
  ck_assert_int_eq(vrna_nucleotide_decode(1, &details), 'A');
  ck_assert_int_eq(vrna_nucleotide_decode(2, &details), 'C');
  ck_assert_int_eq(vrna_nucleotide_decode(3, &details), 'G');
  ck_assert_int_eq(vrna_nucleotide_decode(4, &details), 'U');
  ck_assert_int_eq(vrna_nucleotide_decode(5, &details), 'T');
  ck_assert_int_eq(vrna_nucleotide_decode(6, &details), 'X');
  ck_assert_int_eq(vrna_nucleotide_decode(7, &details), 'K');
  ck_assert_int_eq(vrna_nucleotide_decode(8, &details), 'I');

  details.energy_set = 1;

  ck_assert_int_eq(vrna_nucleotide_decode(-64, &details), '\0');
  ck_assert_int_eq(vrna_nucleotide_decode(31, &details), '_');
  ck_assert_int_eq(vrna_nucleotide_decode(1, &details), 'A');
  ck_assert_int_eq(vrna_nucleotide_decode(3, &details), 'C');
  ck_assert_int_eq(vrna_nucleotide_decode(7, &details), 'G');
  ck_assert_int_eq(vrna_nucleotide_decode(21, &details), 'U');
  ck_assert_int_eq(vrna_nucleotide_decode(20, &details), 'T');
  ck_assert_int_eq(vrna_nucleotide_decode(24, &details), 'X');
  ck_assert_int_eq(vrna_nucleotide_decode(11, &details), 'K');
  ck_assert_int_eq(vrna_nucleotide_decode(9, &details), 'I');
}

#test test_sequence_encoding
{
  vrna_md_t details = {
    0
  };
  short     *data;

  data = vrna_seq_encode_simple("_AUGC", &details);
  ck_assert_int_eq(data[0], 5); //sequence length
  ck_assert_int_eq(data[1], 0);
  ck_assert_int_eq(data[2], 1);
  ck_assert_int_eq(data[3], 4);
  ck_assert_int_eq(data[4], 3);
  ck_assert_int_eq(data[5], 2);
  ck_assert_int_eq(data[6], 0); //value stored in data[1]
  free(data);

  data = vrna_seq_encode_simple("augc", &details);
  ck_assert_int_eq(data[0], 4); //sequence length
  ck_assert_int_eq(data[1], 1);
  ck_assert_int_eq(data[2], 4);
  ck_assert_int_eq(data[3], 3);
  ck_assert_int_eq(data[4], 2);
  ck_assert_int_eq(data[5], 1); //value stored in data[1]
  free(data);
}
//@TODO: type = 1
//@TODO: details.energy_set = 1

#tcase Model_Details

#test test_vrna_md_update
{
  vrna_md_t details = {
    0
  };
  int       i, j, count;

  vrna_md_update(&details);

  for (i = 0; i <= 4; ++i)
    ck_assert_int_eq(details.alias[i], i);

  ck_assert_int_eq(details.alias[5], 3);
  ck_assert_int_eq(details.alias[6], 2);

  for (i = 7; i <= MAXALPHA; ++i)
    ck_assert_int_eq(details.alias[i], 0);

  ck_assert_int_eq(details.pair[1][4], 5);
  ck_assert_int_eq(details.pair[1][7], 5);
  ck_assert_int_eq(details.pair[2][3], 1);
  ck_assert_int_eq(details.pair[3][2], 2);
  ck_assert_int_eq(details.pair[3][4], 3);
  ck_assert_int_eq(details.pair[4][1], 6);
  ck_assert_int_eq(details.pair[4][3], 4);
  ck_assert_int_eq(details.pair[4][7], 6);
  ck_assert_int_eq(details.pair[5][6], 2);
  ck_assert_int_eq(details.pair[6][5], 1);
  ck_assert_int_eq(details.pair[7][1], 6);
  ck_assert_int_eq(details.pair[7][4], 5);

  for (i = 0, count = 0; i < NBASES; ++i)
    for (j = 0; j < NBASES; ++j)
      if (details.pair[i][j] == 0)
        ++count;

  ck_assert_int_eq(count, 52);

  ck_assert_int_eq(details.rtype[0], 0);
  ck_assert_int_eq(details.rtype[1], 2);
  ck_assert_int_eq(details.rtype[2], 1);
  ck_assert_int_eq(details.rtype[3], 4);
  ck_assert_int_eq(details.rtype[4], 3);
  ck_assert_int_eq(details.rtype[5], 6);
  ck_assert_int_eq(details.rtype[6], 5);
  ck_assert_int_eq(details.rtype[7], 7);
}

//@TODO: details.noGU = 1
//@TODO: details.nonstandards
//@TODO: details.energyset = [1, 2, 3]

#tcase Structure_Utils

#test test_get_ptypes
{
  vrna_md_t details = {
    0
  };
  const int len         = 12;
  short     sequence[]  = {
    len, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1
  };                                                               //ACGUACGUACGU
  int       i, j, count;
  int       *idx;
  char      *ptype;

  details.min_loop_size = TURN;
  int       results[][3] = { { 7,  2, 1 },
                             { 8,  1, 5 },
                             { 8,  3, 3 },
                             { 9,  4, 6 },
                             { 10, 3, 2 },
                             { 11, 2, 1 },
                             { 11, 4, 4 },
                             { 11, 6, 1 },
                             { 12, 1, 5 },
                             { 12, 3, 3 },
                             { 12, 5, 5 },
                             { 12, 7, 3 },
                             { 0,  0, 0 } };

  vrna_md_update(&details);

  ptype = get_ptypes(sequence, &details, 0);
  idx   = vrna_idx_col_wise(len);

  for (i = 0; results[i][0]; ++i)
    ck_assert_int_eq(ptype[idx[results[i][0]] + results[i][1]], results[i][2]);

  for (j = 1, count = 0; j <= len; ++j)
    for (i = 1; i <= j; ++i)
      if (ptype[idx[j] + i] == 0)
        ++count;

  ck_assert_int_eq(count, 66);

  free(idx);
  free(ptype);
}

#test test_pack_unpack_structure
{
  int i;
  vrna_init_rand();
  for (i = 0; i < 16; i++) {
    /* generate random sequence */
    char *seq = vrna_random_string(100, "ACGU");
    char *ss = (char *)space(sizeof(char) * (strlen(seq) + 1));

    /* compute structure */
    (void)vrna_fold(seq, ss);

    /* compress structure */
    char *ss_packed = vrna_db_pack(ss);

    /* uncompress structure again */
    char *ss_unpacked = vrna_db_unpack(ss_packed);

    /* compare original and packed/unpacked structure */
    ck_assert_str_eq(ss, ss_unpacked);

    /* cleanup memory */
    free(ss_unpacked);
    free(ss_packed);
    free(ss);
    free(seq);
  }
}

#test test_pack_lexicographic_order
{
  int i, j, k, l, m;
  char db[3] = { '.', '(', ')' };
  char **uncompressed = (char **)space(sizeof(char *) * 245);
  char **compressed = (char **)space(sizeof(char *) * 245);

  /* generate all (possibly invalid) db strings of length 5 */
  size_t counter = 0;
  for (i = 0; i < 3; i++) {
    for (j = 0; j < 3; j++) {
      for (k = 0; k < 3; k++) {
        for (l = 0; l < 3; l++) {
          for (m = 0; m < 3; m++) {
            char *str = (char *)space(sizeof(char) * 6);
            str[0] = db[i];
            str[1] = db[j];
            str[2] = db[k];
            str[3] = db[l];
            str[4] = db[m];
            str[5] = '\0';
            uncompressed[counter] = str;
            compressed[counter]   = vrna_db_pack(str);
            printf("%d\t%s\t%s\n", counter, uncompressed[counter], vrna_db_unpack(compressed[counter]));
            counter++;
          }
        }
      }
    }
  }

  /* sort both lists of structures */
  qsort(uncompressed, 243, sizeof(char *), compare_str);
  qsort(compressed, 243, sizeof(char *), compare_str);

  /* now, go through both lists and pair-wise compare their elements */
  for (i = 0; i < 243; i++) {
    char *decompressed = vrna_db_unpack(compressed[i]);

    j = 4;
    while (uncompressed[i][j] == '(') {
      uncompressed[i][j] = '\0';
      if (j == 0)
        break;
      j--;
    }

    ck_assert_str_eq(uncompressed[i], decompressed);
    free(decompressed);
    free(compressed[i]);
    free(uncompressed[i]);
  }
  free(compressed);
  free(uncompressed);
}


//@TODO: extend alphabeth
//@TODO: details.noLP = 1
//@TODO: idx_type = 1


#main-pre
    srunner_set_tap(sr, "-");
