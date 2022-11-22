import java.awt.*;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.MathContext;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.ArrayList;
import java.util.BitSet;
import java.util.List;
import java.util.regex.Pattern;

public class NumberSimulator {

    public static void main(String[] args) {
        new NumberSimulator();
    }

    private NumberSimulator() {
        try {

            final BufferedWriter output = new BufferedWriter(new OutputStreamWriter(System.out));
            DecimalFormatSymbols symbols = new DecimalFormatSymbols();
            symbols.setGroupingSeparator('_');
            symbols.setDecimalSeparator('.');
            final DecimalFormat df = new DecimalFormat(",###,###.00", symbols);
            df.setGroupingUsed(true);

            float f = Float.MAX_VALUE;
            System.out.println(df.format(f));
            f += 999999_10_141_204_400_000_000_000_000_000_000_000f;
            System.out.println(Float.isInfinite(f) ? f : Float.isNaN(f) ? f : df.format(f));

            System.out.println();

            double d = Double.MAX_VALUE;
            System.out.println(df.format(d));
            d += Double.MAX_VALUE;
            System.out.println(Double.isInfinite(d) ? d : Double.isNaN(d) ? d : df.format(d));

//            final BigDecimal[] keys = {
//                    /* 0 */ new BigDecimal("1.00".replaceAll("_", "")),
//                    /* 1 */ new BigDecimal("2.00".replaceAll("_", "")),
//                    /* 2 */ new BigDecimal("4.00".replaceAll("_", "")),
//                    /* 3 */ new BigDecimal("8.00".replaceAll("_", "")),
//                    /* 4 */ new BigDecimal("16.00".replaceAll("_", "")),
//                    /* 5 */ new BigDecimal("32.00".replaceAll("_", "")),
//                    /* 6 */ new BigDecimal("64.00".replaceAll("_", "")),
//                    /* 7 */ new BigDecimal("128.00".replaceAll("_", "")),
//                    /* 8 */ new BigDecimal("256.00".replaceAll("_", "")),
//                    /* 9 */ new BigDecimal("512.00".replaceAll("_", "")),
//                    /* 10 */ new BigDecimal("1_024.00".replaceAll("_", "")),
//                    /* 11 */ new BigDecimal("2_048.00".replaceAll("_", "")),
//                    /* 12 */ new BigDecimal("4_096.00".replaceAll("_", "")),
//                    /* 13 */ new BigDecimal("8_192.00".replaceAll("_", "")),
//                    /* 14 */ new BigDecimal("16_384.00".replaceAll("_", "")),
//                    /* 15 */ new BigDecimal("32_768.00".replaceAll("_", "")),
//                    /* 16 */ new BigDecimal("65_536.00".replaceAll("_", "")),
//                    /* 17 */ new BigDecimal("131_072.00".replaceAll("_", "")),
//                    /* 18 */ new BigDecimal("262_144.00".replaceAll("_", "")),
//                    /* 19 */ new BigDecimal("524_288.00".replaceAll("_", "")),
//                    /* 20 */ new BigDecimal("1_048_576.00".replaceAll("_", "")),
//                    /* 21 */ new BigDecimal("2_097_152.00".replaceAll("_", "")),
//                    /* 22 */ new BigDecimal("4_194_304.00".replaceAll("_", "")),
//                    /* 23 */ new BigDecimal("8_388_608.00".replaceAll("_", "")),
//                    /* 24 */ new BigDecimal("16_777_216.00".replaceAll("_", "")),
//                    /* 25 */ new BigDecimal("33_554_432.00".replaceAll("_", "")),
//                    /* 26 */ new BigDecimal("67_108_864.00".replaceAll("_", "")),
//                    /* 27 */ new BigDecimal("134_217_728.00".replaceAll("_", "")),
//                    /* 28 */ new BigDecimal("268_435_456.00".replaceAll("_", "")),
//                    /* 29 */ new BigDecimal("536_870_912.00".replaceAll("_", "")),
//                    /* 30 */ new BigDecimal("1_073_741_824.00".replaceAll("_", "")),
//                    /* 31 */ new BigDecimal("2_147_483_648.00".replaceAll("_", "")),
//                    /* 32 */ new BigDecimal("4_294_967_296.00".replaceAll("_", "")),
//                    /* 33 */ new BigDecimal("8_589_934_592.00".replaceAll("_", "")),
//                    /* 34 */ new BigDecimal("17_179_869_184.00".replaceAll("_", "")),
//                    /* 35 */ new BigDecimal("34_359_738_368.00".replaceAll("_", "")),
//                    /* 36 */ new BigDecimal("68_719_476_736.00".replaceAll("_", "")),
//                    /* 37 */ new BigDecimal("137_438_953_472.00".replaceAll("_", "")),
//                    /* 38 */ new BigDecimal("274_877_906_944.00".replaceAll("_", "")),
//                    /* 39 */ new BigDecimal("549_755_813_888.00".replaceAll("_", "")),
//                    /* 40 */ new BigDecimal("1_099_511_627_776.00".replaceAll("_", "")),
//                    /* 41 */ new BigDecimal("2_199_023_255_552.00".replaceAll("_", "")),
//                    /* 42 */ new BigDecimal("4_398_046_511_104.00".replaceAll("_", "")),
//                    /* 43 */ new BigDecimal("8_796_093_022_208.00".replaceAll("_", "")),
//                    /* 44 */ new BigDecimal("17_592_186_044_416.00".replaceAll("_", "")),
//                    /* 45 */ new BigDecimal("35_184_372_088_832.00".replaceAll("_", "")),
//                    /* 46 */ new BigDecimal("70_368_744_177_664.00".replaceAll("_", "")),
//                    /* 47 */ new BigDecimal("140_737_488_355_328.00".replaceAll("_", "")),
//                    /* 48 */ new BigDecimal("281_474_976_710_656.00".replaceAll("_", "")),
//                    /* 49 */ new BigDecimal("562_949_953_421_312.00".replaceAll("_", "")),
//                    /* 50 */ new BigDecimal("1_125_899_906_842_624.00".replaceAll("_", "")),
//                    /* 51 */ new BigDecimal("2_251_799_813_685_248.00".replaceAll("_", "")),
//                    /* 52 */ new BigDecimal("4_503_599_627_370_496.00".replaceAll("_", "")),
//                    /* 53 */ new BigDecimal("9_007_199_254_740_992.00".replaceAll("_", "")),
//                    /* 54 */ new BigDecimal("18_014_398_509_481_984.00".replaceAll("_", "")),
//                    /* 55 */ new BigDecimal("36_028_797_018_963_968.00".replaceAll("_", "")),
//                    /* 56 */ new BigDecimal("72_057_594_037_927_936.00".replaceAll("_", "")),
//                    /* 57 */ new BigDecimal("144_115_188_075_855_872.00".replaceAll("_", "")),
//                    /* 58 */ new BigDecimal("288_230_376_151_711_744.00".replaceAll("_", "")),
//                    /* 59 */ new BigDecimal("576_460_752_303_423_488.00".replaceAll("_", "")),
//                    /* 60 */ new BigDecimal("1_152_921_504_606_846_976.00".replaceAll("_", "")),
//                    /* 61 */ new BigDecimal("2_305_843_009_213_693_952.00".replaceAll("_", "")),
//                    /* 62 */ new BigDecimal("4_611_686_018_427_387_904.00".replaceAll("_", "")),
//                    /* 63 */ new BigDecimal("9_223_372_036_854_775_808.00".replaceAll("_", "")),
//                    /* 64 */ new BigDecimal("18_446_744_073_709_551_616.00".replaceAll("_", "")),
//                    /* 65 */ new BigDecimal("36_893_488_147_419_103_232.00".replaceAll("_", "")),
//                    /* 66 */ new BigDecimal("73_786_976_294_838_206_464.00".replaceAll("_", "")),
//                    /* 67 */ new BigDecimal("147_573_952_589_676_412_928.00".replaceAll("_", "")),
//                    /* 68 */ new BigDecimal("295_147_905_179_352_825_856.00".replaceAll("_", "")),
//                    /* 69 */ new BigDecimal("590_295_810_358_705_651_712.00".replaceAll("_", "")),
//                    /* 70 */ new BigDecimal("1_180_591_620_717_411_303_424.00".replaceAll("_", "")),
//                    /* 71 */ new BigDecimal("2_361_183_241_434_822_606_848.00".replaceAll("_", "")),
//                    /* 72 */ new BigDecimal("4_722_366_482_869_645_213_696.00".replaceAll("_", "")),
//                    /* 73 */ new BigDecimal("9_444_732_965_739_290_427_392.00".replaceAll("_", "")),
//                    /* 74 */ new BigDecimal("18_889_465_931_478_580_854_784.00".replaceAll("_", "")),
//                    /* 75 */ new BigDecimal("37_778_931_862_957_161_709_568.00".replaceAll("_", "")),
//                    /* 76 */ new BigDecimal("75_557_863_725_914_323_419_136.00".replaceAll("_", "")),
//                    /* 77 */ new BigDecimal("151_115_727_451_828_646_838_272.00".replaceAll("_", "")),
//                    /* 78 */ new BigDecimal("302_231_454_903_657_293_676_544.00".replaceAll("_", "")),
//                    /* 79 */ new BigDecimal("604_462_909_807_314_587_353_088.00".replaceAll("_", "")),
//                    /* 80 */ new BigDecimal("1_208_925_819_614_629_174_706_176.00".replaceAll("_", "")),
//                    /* 81 */ new BigDecimal("2_417_851_639_229_258_349_412_352.00".replaceAll("_", "")),
//                    /* 82 */ new BigDecimal("4_835_703_278_458_516_698_824_704.00".replaceAll("_", "")),
//                    /* 83 */ new BigDecimal("9_671_406_556_917_033_397_649_408.00".replaceAll("_", "")),
//                    /* 84 */ new BigDecimal("19_342_813_113_834_066_795_298_816.00".replaceAll("_", "")),
//                    /* 85 */ new BigDecimal("38_685_626_227_668_133_590_597_632.00".replaceAll("_", "")),
//                    /* 86 */ new BigDecimal("77_371_252_455_336_267_181_195_264.00".replaceAll("_", "")),
//                    /* 87 */ new BigDecimal("154_742_504_910_672_534_362_390_528.00".replaceAll("_", "")),
//                    /* 88 */ new BigDecimal("309_485_009_821_345_068_724_781_056.00".replaceAll("_", "")),
//                    /* 89 */ new BigDecimal("618_970_019_642_690_137_449_562_112.00".replaceAll("_", "")),
//                    /* 90 */ new BigDecimal("1_237_940_039_285_380_274_899_124_224.00".replaceAll("_", "")),
//                    /* 91 */ new BigDecimal("2_475_880_078_570_760_549_798_248_448.00".replaceAll("_", "")),
//                    /* 92 */ new BigDecimal("4_951_760_157_141_521_099_596_496_896.00".replaceAll("_", "")),
//                    /* 93 */ new BigDecimal("9_903_520_314_283_042_199_192_993_792.00".replaceAll("_", "")),
//                    /* 94 */ new BigDecimal("19_807_040_628_566_084_398_385_987_584.00".replaceAll("_", "")),
//                    /* 95 */ new BigDecimal("39_614_081_257_132_168_796_771_975_168.00".replaceAll("_", "")),
//                    /* 96 */ new BigDecimal("79_228_162_514_264_337_593_543_950_336.00".replaceAll("_", "")),
//                    /* 97 */ new BigDecimal("158_456_325_028_528_675_187_087_900_672.00".replaceAll("_", "")),
//                    /* 98 */ new BigDecimal("316_912_650_057_057_350_374_175_801_344.00".replaceAll("_", "")),
//                    /* 99 */ new BigDecimal("633_825_300_114_114_700_748_351_602_688.00".replaceAll("_", "")),
//                    /* 100 */ new BigDecimal("1_267_650_600_228_229_401_496_703_205_376.00".replaceAll("_", "")),
//                    /* 101 */ new BigDecimal("2_535_301_200_456_458_802_993_406_410_752.00".replaceAll("_", "")),
//                    /* 102 */ new BigDecimal("5_070_602_400_912_917_605_986_812_821_504.00".replaceAll("_", "")),
//                    /* 103 */ new BigDecimal("10_141_204_801_825_835_211_973_625_643_008.00".replaceAll("_", "")),
//                    /* 104 */ new BigDecimal("20_282_409_603_651_670_423_947_251_286_016.00".replaceAll("_", "")),
//                    /* 105 */ new BigDecimal("40_564_819_207_303_340_847_894_502_572_032.00".replaceAll("_", "")),
//                    /* 106 */ new BigDecimal("81_129_638_414_606_681_695_789_005_144_064.00".replaceAll("_", "")),
//                    /* 107 */ new BigDecimal("162_259_276_829_213_363_391_578_010_288_128.00".replaceAll("_", "")),
//                    /* 108 */ new BigDecimal("324_518_553_658_426_726_783_156_020_576_256.00".replaceAll("_", "")),
//                    /* 109 */ new BigDecimal("649_037_107_316_853_453_566_312_041_152_512.00".replaceAll("_", "")),
//                    /* 110 */ new BigDecimal("1_298_074_214_633_706_907_132_624_082_305_024.00".replaceAll("_", "")),
//                    /* 111 */ new BigDecimal("2_596_148_429_267_413_814_265_248_164_610_048.00".replaceAll("_", "")),
//                    /* 112 */ new BigDecimal("5_192_296_858_534_827_628_530_496_329_220_096.00".replaceAll("_", "")),
//                    /* 113 */ new BigDecimal("10_384_593_717_069_655_257_060_992_658_440_192.00".replaceAll("_", "")),
//                    /* 114 */ new BigDecimal("20_769_187_434_139_310_514_121_985_316_880_384.00".replaceAll("_", "")),
//                    /* 115 */ new BigDecimal("41_538_374_868_278_621_028_243_970_633_760_768.00".replaceAll("_", "")),
//                    /* 116 */ new BigDecimal("83_076_749_736_557_242_056_487_941_267_521_536.00".replaceAll("_", "")),
//                    /* 117 */ new BigDecimal("166_153_499_473_114_484_112_975_882_535_043_072.00".replaceAll("_", "")),
//                    /* 118 */ new BigDecimal("332_306_998_946_228_968_225_951_765_070_086_144.00".replaceAll("_", "")),
//                    /* 119 */ new BigDecimal("664_613_997_892_457_936_451_903_530_140_172_288.00".replaceAll("_", "")),
//                    /* 120 */ new BigDecimal("1_329_227_995_784_915_872_903_807_060_280_344_576.00".replaceAll("_", "")),
//                    /* 121 */ new BigDecimal("2_658_455_991_569_831_745_807_614_120_560_689_152.00".replaceAll("_", "")),
//                    /* 122 */ new BigDecimal("5_316_911_983_139_663_491_615_228_241_121_378_304.00".replaceAll("_", "")),
//                    /* 123 */ new BigDecimal("10_633_823_966_279_326_983_230_456_482_242_756_608.00".replaceAll("_", "")),
//                    /* 124 */ new BigDecimal("21_267_647_932_558_653_966_460_912_964_485_513_216.00".replaceAll("_", "")),
//                    /* 125 */ new BigDecimal("42_535_295_865_117_307_932_921_825_928_971_026_432.00".replaceAll("_", "")),
//                    /* 126 */ new BigDecimal("85_070_591_730_234_615_865_843_651_857_942_052_864.00".replaceAll("_", "")),
//                    /* 127 */ new BigDecimal("170_141_183_460_469_231_731_687_303_715_884_105_728.00".replaceAll("_", "")),
//                    /* 128 */ new BigDecimal("340_282_366_920_938_463_463_374_607_431_768_211_456.00".replaceAll("_", ""))
//            };
//
//            final int len = keys.length - 1;
//            int threads = 24;
//            final int split = (int) Math.ceil((float)len / threads);
//            final Point[] ranges = new Point[threads];
//            for (int i = 0; i < threads; i++) {
//                int minRange = i * split;
//                int maxRange = Math.min(minRange + split, len);
//                if (maxRange == len) break;
//
//                ranges[i] = new Point(minRange, maxRange);
//
//                output.write(String.format("[%d] min: %d, max: %d\n", i + 1, minRange, maxRange));
//                output.flush();
//            }
//            int lastMax = 0;
//            List<Point> pointList = new ArrayList<>();
//            for (Point range : ranges) {
//                if (range == null) {
//                    if (len > lastMax) {
//                        pointList.add(new Point(lastMax, len + 1));
//                    }
//                    break;
//                }
//                pointList.add(range);
//                lastMax = range.y;
//            }
//            Thread[] ts = new Thread[pointList.size()];
//            final BigDecimal two = BigDecimal.valueOf(2);
//            for (int i = 0; i < ts.length; i++) {
//                Point range = pointList.get(i);
//                final int min = range.x;
//                final int max = range.y;
//                final int id = i;
//                ts[i] = new Thread(new Runnable() {
//                    @Override
//                    public void run() {
//                        try {
//                            output.write(String.format("[%d] Starting thread\n", id));
//                            output.flush();
//
//                            int i = min;
//                            BigDecimal big = keys[i], min = big;
//                            for (; i < max; i++) {
////                                output.write(String.format("\t[%d] i: %d, big: %s\n", id, i, df.format(big)));
//                                big = big.multiply(two);
//                            }
//                            output.write(String.format("\t[%d] min: %s\n", id, df.format(min)));
//                            output.write(String.format("\t[%d] big: %s\n", id, df.format(big)));
//
//                            BigDecimal lastIncrement = BigDecimal.ONE;
//                            BigDecimal increment = BigDecimal.ONE;
//                            BigDecimal f = min;
//                            for (;;) {
//                                try {
//                                    BigDecimal old = f;
//                                    boolean changed = false;
//                                    while (true) {
//                                        f = f.add(increment, MathContext.DECIMAL64);
//                                        if (old.floatValue() == f.floatValue()) {
//                                            increment = increment.multiply(two, MathContext.DECIMAL64);
//                                            f = old;
//                                            changed = true;
//                                            continue;
//                                        }
//                                        break;
//                                    }
//                                    if (changed && !increment.equals(lastIncrement)) {
//                                        output.write(String.format("\t[%d] [%s] %s\n", id, df.format(increment), df.format(f.floatValue())));
//                                        output.flush();
//                                    }
//                                    if (f.compareTo(big) >= 0) {
//                                        break;
//                                    }
//                                    lastIncrement = increment;
//                                    increment = BigDecimal.ONE;
//                                } catch (Throwable t) {
//                                    t.printStackTrace();
//                                    break;
//                                }
//                            }
//                            output.write(String.format("\t[%d] [%s] %s\n", id, df.format(increment), df.format(f.floatValue())));
//                            output.flush();
//
//                            output.write(String.format("[%d] Ending thread\n", id));
//                            output.flush();
//                        } catch (Throwable t) {
//                            t.printStackTrace();
//                        }
//                    }
//                });
//                if (i == 21) {
//                    ts[i].start();
//                    break;
//                }
//            }
//            for (Thread t : ts) {
////                t.start();
//                if (t != null && t.getState() == Thread.State.RUNNABLE)
//                    t.join();
//            }

//            BigDecimal two = BigDecimal.valueOf(2);
//            BigDecimal max = new BigDecimal("340_282_356_779_733_661_637_539_395_458_142_568_447".replaceAll("_", ""));
//            int mul = 0;
//            output.write("\tBigDecimal[] keys = {\n");
//            for (BigDecimal big = BigDecimal.ONE;;) {
//                output.write(String.format("\t\t/* %d */ new BigDecimal(\"%s\".replaceAll(\"_\", \"\"))", mul, df.format(big)));
//                output.flush();
//                if (big.compareTo(max) >= 0) {
//                    output.write("\n");
//                    break;
//                }
//                output.write(",\n");
//                big = big.multiply(two);
//                mul++;
//                Thread.sleep(10);
//            }
//            output.write("\t};");
//            output.flush();

//            String test = "340282356779733661637539395458142568447"; // + 1 = ∞
//            float f = Float.parseFloat(test);
//            System.out.println(df.format(f));
//
//            f = Float.parseFloat("340_282_246_638_528_860_000_000_000_000_000_000_000".replaceAll(Pattern.quote("_"), ""));
//            System.out.println(df.format(f));

//            BigDecimal test = new BigDecimal("340282346638528860000000000000000000000");
////            BigDecimal add = new BigDecimal("10000000000000000000000");
//            BigDecimal add = new BigDecimal("100000000000000000000000000");
//            while (true) {
//                float oldValue = test.floatValue();
//                test = test.subtract(add);
//                float newValue = test.floatValue();
//                if (oldValue != newValue)
//                    output.write(String.format("[%s] %,f - %,f\n", df.format(test), oldValue, newValue));
//            }

//            float test = 16_777_213f;
//            System.out.printf("%,f\n", test);
//
//            test += 1.0f;
//            System.out.printf("%,f\n", test);
//
//            test += 1.0f;
//            System.out.printf("%,f\n", test);
//
//            test += 1.0f;
//            System.out.printf("%,f\n", test);
//
//            test += 2.0f;
//            System.out.printf("! %,f\n", test); // corrupt
//
//            test += 2.0f;
//            System.out.printf("%,f\n", test);
//
//            test += 2.0f;
//            System.out.printf("%,f\n", test);
//
//            test += 2.0f;
//            System.out.printf("%,f\n", test);
//
//            test += 2.0f;
//            System.out.printf("%,f\n", test);

//            String testFloat = "170141203742878835383357727663135391744";
//            float f = Float.parseFloat(testFloat);
//            System.out.println(new BigDecimal(f).multiply(BigDecimal.valueOf(2)).toPlainString());

//            BigDecimal two = BigDecimal.valueOf(2);
//            BigDecimal lastIncrement = BigDecimal.ONE;
//            BigDecimal f = new BigDecimal("0", MathContext.DECIMAL64);
//            int additions = 0;
//            while (true) {
//                try {
//                    BigDecimal increment = BigDecimal.ONE;
//                    BigDecimal old = f;
//                    boolean changed = false;
//                    int multiplications = 0;
//                    while (true) {
//                        f = old.add(increment, MathContext.DECIMAL64);
//                        if (old.floatValue() == f.floatValue()) {
//                            increment = increment.multiply(two, MathContext.DECIMAL64);
//                            multiplications++;
//                            changed = true;
//                            continue;
//                        }
//                        break;
//                    }
//                    if (changed && !increment.equals(lastIncrement)) {
//                        boolean isHigher = increment.compareTo(lastIncrement) > 0;
//                        output.write(String.format("%s [%s] %s [%d,%d]\n",
//                                        isHigher ? " up " : "down", df.format(increment), df.format(old.floatValue()), additions, multiplications)
//                                .replaceAll(Pattern.quote(","), "."));
//                        output.flush();
//                        additions = 0;
//                    } else {
//                        additions++;
//                    }
//                    lastIncrement = increment;
//                } catch (Throwable t) {
//                    t.printStackTrace();
//                    break;
//                }
//            }
//            output.write(String.format("[%s] %s\n", df.format(lastIncrement), df.format(f.floatValue()))
//                    .replaceAll(Pattern.quote(","), "."));
//            output.flush();

//            String testFloat = "340282356779729999999999999999999999999";
//            float f = Float.parseFloat(testFloat) + 1f;
//            System.out.println(Float.isInfinite(f));
//            System.out.println(Float.isNaN(f));

//            String testFloat = "340282356779733661637539395458142568447";
//            float f = Float.parseFloat(testFloat);
//            BigDecimal big = new BigDecimal(f);
//            System.out.println(big.toPlainString());
//
//            int index = 0;
//            String str = big.toPlainString();
//            while (true) {
//                boolean changes = false;
//                while (true) {
//                    try {
//                        String first = str.substring(0, index);
//                        String last = str.substring(index + 1);
//                        int number = Integer.parseInt(str.substring(index, index + 1)) + 1;
//                        if (number > 9) {
//                            index++;
//                            continue;
//                        }
//                        String test = first + number + last;
//                        System.out.println("a: " + str);
//                        System.out.println("b: " + test);
//                        f = Float.parseFloat(test);
//                        big = new BigDecimal(f);
//                        System.out.println("c: " + big.toPlainString());
//                        str = test;
//                        changes = true;
//                    } catch (NumberFormatException e) {
//                        index++;
//                    } catch (Throwable t) {
//                        t.printStackTrace();
//                        break;
//                    }
//                }
//                if (!changes) break;
//            }

//            int index = 0, number = 9;
//            String template = "xxx,xxx,xxx,xxx,xxx,xxx,xxx,xxx,xxx,xxx,xxx,xxx,xxx".replace(",", "");
//            while (true) {
//                try {
//                    String maxFloat = template;
//                    String first = maxFloat.substring(0, index);
//                    String last = maxFloat.substring(index + 1);
//                    maxFloat = (first + number + last).replace("x", "0");
//                    System.out.println(maxFloat);
//                    float f = Float.parseFloat(maxFloat);
//                    System.out.println(new BigDecimal(f).toPlainString());
////                    if (index == template.length())
////                        break;
//                    template = (first + number + repeatX(last));
//                    System.out.println("NEW TEMPLATE: '" + template + "'");
//                    number = 9;
//                    index++;
//                } catch (NumberFormatException e) {
//                    System.out.println(e.getMessage());
//                    if (--number < 0) {
//                        number = 9;
//                        index++;
//                    }
//                } catch (Throwable ignored) {
//                    break;
//                }
//            }
//
//            System.out.println();
//
//            System.out.println("Found maximum float value: '" + template + "'");
//
//            System.out.println();
//
//            System.out.println("100,000,000,000,000,000,000,000,000,000,000,000,000".replace(",", ""));
//            String o = new BigDecimal(Float.parseFloat("100,000,000,000,000,000,000,000,000,000,000,000,000".replace(",", ""))).toPlainString();
//            System.out.println(o);

//            maxFloat = "340,282,346,638,528,861,000,000,000,000,000,000,000.000000".replace(",", "");
//            System.out.println(maxFloat);
//            f = Float.parseFloat(maxFloat);
//            System.out.println(new BigDecimal(f).toPlainString());
//            f++;
//            System.out.println(new BigDecimal(f).toPlainString());
//
//            System.out.println();
//
//            maxFloat = "340282346638528859811704183484516925440.000000";
//            System.out.println(maxFloat);
//            f = Float.parseFloat(maxFloat);
//            System.out.println(new BigDecimal(f).toPlainString());
//            f++;
//            System.out.println(new BigDecimal(f).toPlainString());

//            int i = 0;
//            System.out.println("[I] zero: " + i);
//            i = Integer.MAX_VALUE;
//            System.out.println("[I] max: " + i);
//            i = Integer.MIN_VALUE;
//            System.out.println("[I] min: " + i);
//
//            System.out.println();
//
//            long l = 0;
//            System.out.println("[L] zero: " + l);
//            l = Long.MAX_VALUE;
//            System.out.println("[L] max: " + l);
//            l = Long.MIN_VALUE;
//            System.out.println("[L] min: " + l);
//
//            System.out.println();
//
//            float f = 0f;
//            System.out.println("[F] zero: " + f);
//            f = Float.MAX_VALUE;
//            System.out.println("[F] max: " + new BigDecimal(f).toPlainString());
//            f = -Float.MAX_VALUE;
//            System.out.println("[F] min: " + new BigDecimal(f).toPlainString());
//            System.out.println("[F] epsilon: " + new BigDecimal(Float.MIN_VALUE).toPlainString());
//
//            System.out.println();
//
//            double d = 0d;
//            System.out.println("[D] zero: " + d);
//            d = Double.MAX_VALUE;
//            System.out.println("[D] max: " + new BigDecimal(d).toPlainString());
//            d = -Double.MAX_VALUE;
//            System.out.println("[D] min: " + new BigDecimal(d).toPlainString());
//            System.out.println("[D] epsilon: " + new BigDecimal(Double.MIN_VALUE).toPlainString());
//
//            System.out.println();
//
//            System.out.println("[TestF 0] " + new BigDecimal(Float.MAX_VALUE).toPlainString());
//            System.out.printf("[TestF 1] %,f\n", Float.MAX_VALUE);
//            System.out.printf("[TestF 2] %,f\n", 340282346638528860000000000000000000000f);
//            System.out.printf("[TestF 3] %,f\n", 340282346638528860000000000000000000001f);
//            System.out.printf("[TestF 4] %,f\n", 340282346638528861000000000000000000000f);
//
//            System.out.println();
//
//            long longMax = Long.MAX_VALUE;
//            System.out.println("[LongMax 1] " + longMax);
//            longMax += 1;
//            System.out.println("[LongMax 2] " + longMax);
//            System.out.println("[LongMin 3] " + Long.MIN_VALUE);
//            System.out.println("[LongMin 4] " + (longMax == Long.MIN_VALUE));

        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    private String repeatX(String last) {
        int len = last.length();
        char[] result = new char[len];
        for (int i = 0; i < len; i++)
            result[i] = 'x';
        return new String(result);
    }

}
