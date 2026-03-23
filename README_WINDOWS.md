# Инструкции за стартиране (Windows / PowerShell)

Това ръководство показва стъпка по стъпка как да инсталирате и стартирате проекта локално на Windows с PowerShell. Всички команди са PowerShell-ready — копирайте и пейстнете в PowerShell (стартирайте като администратор само когато е отбелязано).

Бележки:
- Проектът очаква работещ MongoDB сървър на `127.0.0.1:27017`.
- Файловете, които ще използвате: `seed.js`, `app.js`, `package.json` (в корена на проекта).

---

## 1) Бърза проверка (имате ли `mongod` и Node)

Отворете PowerShell в корена на проекта (папката, съдържаща `app.js`):

```powershell
# Проверка за MongoDB daemon
mongod --version

# Проверка за Node.js
node --version

# Проверка за npm
npm --version
```

Ако някоя команда липсва — следвайте секцията за инсталиране по-долу.

---

## 2) Инсталиране на MongoDB (вариантите)

А) С помощта на Chocolatey (препоръчително ако използвате choco):

```powershell
# Инсталирайте chocolatey (ако нямате)
Set-ExecutionPolicy Bypass -Scope Process -Force; `
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; `
iwr https://community.chocolatey.org/install.ps1 -UseBasicParsing | iex

# Инсталирайте MongoDB Community
choco install mongodb -y

# (След инсталация choco ще добави mongod в PATH)
```

Б) Ръчно (MSI):
- Изтеглете от: https://www.mongodb.com/try/download/community
- Стартирайте MSI и следвайте инсталацията.

В) Docker (ако предпочитате контейнер):

```powershell
docker run -d -p 27017:27017 --name mongodb -v C:\data\db:/data/db mongo:6
```

---

## 3) Създаване на db папка (ако ще стартирате `mongod` ръчно)

```powershell
New-Item -ItemType Directory -Path C:\data\db -Force
```

(В този проект има `data\db` в репото; ако искате да го използвате вместо `C:\data\db`, използвайте пълния път към него в командите по-долу.)

---

## 4) Стартиране на MongoDB

А) Стартиране ръчно (в терминал — оставете прозореца отворен):

```powershell
# Пример: използвайте repo папката като dbpath
mongod --dbpath "C:\Users\atisw\github\WEBTex\data\db" --bind_ip 127.0.0.1
```

Натиснете `Ctrl+C`, за да спрете този процес.

Б) Инсталиране като Windows service (изисква администратор):

```powershell
# Стартирайте PowerShell като Administrator
mongod --dbpath "C:\Users\atisw\github\WEBTex\data\db" --logpath "C:\Users\atisw\github\WEBTex\data\mongod.log" --install
Start-Service MongoDB

# Проверка на статуса
Get-Service -Name MongoDB

# Спиране на услугата
Stop-Service MongoDB

# Премахване на услугата (ако искате)
mongod --remove
```

В) Ако ползвате Docker:

```powershell
docker start mongodb   # стартира контейнера
docker stop mongodb    # спира контейнера
```

---

## 5) Инсталиране на Node зависимости и стартиране на приложението

Отворете PowerShell в корена на проекта (`C:\Users\atisw\github\WEBTex`) и изпълнете:

```powershell
# Инсталирайте зависимостите
npm run install:packages

# (ако вече са инсталирани, пропуснете)

# (Опция) Можете да стартирате seed скрипта за да попълните базата
# (вижте по-долу за подробности и предупреждение — може да отнеме време)
node seed.js

# Стартирайте сървъра
npm start

# Сега отворете браузър: http://localhost:3000
```

---

## 6) Seed (попълване) — бележки и бързи опции

- `seed.js` добавя голям брой документи (за демонстрация). Това може да отнеме значително време и да използва много RAM. Ако искате по-бърз тест, отворете `seed.js` и намалете броя на документите (например на 2000).

Бързо изпълнение (малка проба):

```powershell
# Редактирайте seed.js и намалете итерациите (например 2000 вместо 200000)
notepad .\seed.js

# След това стартирайте
node seed.js
```

За да видите броя документи в колекцията:

```powershell
mongosh --eval "db = db.getSiblingDB('demoDB'); print('count=', db.users.count())"
```

---

## 7) Проверка на връзка и отстраняване на проблеми

- Тествайте дали портът слуша:

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 27017
```

- Проверете дали можете да пингнете MongoDB чрез `mongosh`:

```powershell
mongosh --eval "db.adminCommand({ping:1})"
```

- Ако виждате `ECONNREFUSED`, уверете се че `mongod` е стартиран и че използвате `127.0.0.1` (IPv4) вместо `localhost`, ако системата се опитва да ползва IPv6 (::1).

---

## 8) Как да спрете базата и сървъра

- Ако сте стартирали `mongod` в терминал (ръчно), спрете с Ctrl+C в този прозорец.
- Ако е инсталиран като услуга:

```powershell
Stop-Service MongoDB
```

- Ако е в Docker:

```powershell
docker stop mongodb
```

- За да спрете Node сървъра, в прозореца където сте стартирали `npm start` натиснете `Ctrl+C`.

---

## 9) Бързи съвети за дебъг/производителност

- Ако `seed.js`/`app.js` се опитват да се свържат към `::1` (IPv6) и връзката се проваля, заменете `localhost` с `127.0.0.1` в файловете `seed.js` и `app.js`.
- За страницирането: използвайте cursor/ObjectId или индексирани полета вместо `.skip()` при големи колекции.

---

Ако искате, мога да добавя бърз PowerShell скрипт (`start-all.ps1`) който автоматизира стартирането (mongod, seed и npm start). Желаете ли това? 
