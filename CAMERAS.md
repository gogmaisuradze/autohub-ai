# AutoHub — კამერები და რადარები

რუკა კითხულობს `public/data/cameras.geojson`-ს. ნაჩვენებია OSM სიჩქარის, საშუალო სიჩქარისა და შუქნიშნის კონტროლის კამერები; ზოგადი სამეთვალყურეო კამერები გამოტოვებულია. საზოგადოებრივი მონაცემების სრული დაფარვა და აქტიურობა გარანტირებული არ არის.

განახლება: `npm run cameras:update`, შემდეგ `npm run build`.

თუ Overpass მიუწვდომელია: გახსენით https://overpass-turbo.eu/, ჩასვით `scripts/update-cameras.mjs`-ში მოცემული query, გაუშვით Run და Export → raw data → download. შემდეგ: `node scripts/update-cameras.mjs /absolute/path/export.json`. ეს ბრძანება ელოდება Overpass JSON-ს, არა GeoJSON-ს.

ჩამოტვირთვის შეცდომისას ძველი ფაილი უცვლელი რჩება. ფაილის არქონისას რუკა აჩვენებს მონაცემების მიუწვდომლობას და არ აჩვენებს გამოგონილ რადარებს. ფაილის განახლების დრო არ ნიშნავს თითოეული კამერის ადგილზე გადამოწმებას.

მარკერზე ჩანს კამერის ტიპი, წყაროში არსებული ლიმიტი და OSM ბმული. ლიმიტის არქონისას წერია „უცნობია“. საშუალო სიჩქარის კამერა წერტილია; კონტროლირებადი მონაკვეთის საზღვრები ამ ვერსიაში არ იხაზება.

ტესტი: `node scripts/cameras.test.mjs`.

წყაროები: https://wiki.openstreetmap.org/wiki/Tag:highway%3Dspeed_camera და https://wiki.openstreetmap.org/wiki/Relation:enforcement . მონაცემების ლიცენზია: https://www.openstreetmap.org/copyright (ODbL).
