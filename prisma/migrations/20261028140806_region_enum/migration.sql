-- prisma migrate does not run a migration in a transaction, so wrap it by hand:
-- a failed ALTER must not leave the type behind for the retry
BEGIN;

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('TEL_AVIV', 'RAMAT_GAN_GIVATAYIM', 'BAT_YAM_HOLON', 'PETAH_TIKVA', 'RISHON_LEZION', 'HERZLIYA_RAANANA', 'BNEI_BRAK', 'WHOLE_COUNTRY', 'OTHER');

-- AlterTable: existing rows hold the option label in the locale of the page,
-- so map every known label to its code; an unknown label yields NULL and fails NOT NULL
ALTER TABLE "Lead" ALTER COLUMN "region" TYPE "Region" USING (
  CASE "region"
    -- ru
    WHEN 'Тель-Авив' THEN 'TEL_AVIV'::"Region"
    WHEN 'Рамат-Ган и Гиватаим' THEN 'RAMAT_GAN_GIVATAYIM'::"Region"
    WHEN 'Бат-Ям и Холон' THEN 'BAT_YAM_HOLON'::"Region"
    WHEN 'Петах-Тиква' THEN 'PETAH_TIKVA'::"Region"
    WHEN 'Ришон-ле-Цион' THEN 'RISHON_LEZION'::"Region"
    WHEN 'Герцлия и Раанана' THEN 'HERZLIYA_RAANANA'::"Region"
    WHEN 'Бней-Брак' THEN 'BNEI_BRAK'::"Region"
    WHEN 'Вся страна' THEN 'WHOLE_COUNTRY'::"Region"
    WHEN 'Другой' THEN 'OTHER'::"Region"
    -- en
    WHEN 'Tel Aviv' THEN 'TEL_AVIV'::"Region"
    WHEN 'Ramat Gan and Givatayim' THEN 'RAMAT_GAN_GIVATAYIM'::"Region"
    WHEN 'Bat Yam and Holon' THEN 'BAT_YAM_HOLON'::"Region"
    WHEN 'Petah Tikva' THEN 'PETAH_TIKVA'::"Region"
    WHEN 'Rishon LeZion' THEN 'RISHON_LEZION'::"Region"
    WHEN 'Herzliya and Ra''anana' THEN 'HERZLIYA_RAANANA'::"Region"
    WHEN 'Bnei Brak' THEN 'BNEI_BRAK'::"Region"
    WHEN 'Whole country' THEN 'WHOLE_COUNTRY'::"Region"
    WHEN 'Other' THEN 'OTHER'::"Region"
    -- he
    WHEN 'תל אביב' THEN 'TEL_AVIV'::"Region"
    WHEN 'רמת גן וגבעתיים' THEN 'RAMAT_GAN_GIVATAYIM'::"Region"
    WHEN 'בת ים וחולון' THEN 'BAT_YAM_HOLON'::"Region"
    WHEN 'פתח תקווה' THEN 'PETAH_TIKVA'::"Region"
    WHEN 'ראשון לציון' THEN 'RISHON_LEZION'::"Region"
    WHEN 'הרצליה ורעננה' THEN 'HERZLIYA_RAANANA'::"Region"
    WHEN 'בני ברק' THEN 'BNEI_BRAK'::"Region"
    WHEN 'כל הארץ' THEN 'WHOLE_COUNTRY'::"Region"
    WHEN 'אחר' THEN 'OTHER'::"Region"
  END
);

COMMIT;
