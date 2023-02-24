-- CreateTable
CREATE TABLE "auftraggeber" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "straße" VARCHAR(50) NOT NULL,
    "hausnummer" INTEGER NOT NULL,
    "plz" VARCHAR(5) NOT NULL,
    "ort" VARCHAR(50) NOT NULL,
    "telefon" VARCHAR(20) NOT NULL,
    "email" VARCHAR(50) NOT NULL
);

-- CreateTable
CREATE TABLE "chats" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),

    CONSTRAINT "chats_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatteilnehmer" (
    "chatid" UUID NOT NULL,
    "userid" INTEGER NOT NULL,
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),

    CONSTRAINT "chatteilnehmer_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nachrichten" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "chatid" UUID NOT NULL,
    "nachricht" VARCHAR NOT NULL,
    "userid" INTEGER NOT NULL,

    CONSTRAINT "nachrichten_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objekte" (
    "id" SERIAL NOT NULL,
    "objekt" VARCHAR(20) NOT NULL,
    "beschreibung" VARCHAR(150) NOT NULL,
    "auftraggeberID" INTEGER NOT NULL,
    "straße" VARCHAR(50) NOT NULL,
    "hausnummer" INTEGER NOT NULL,
    "plz" INTEGER NOT NULL,
    "ort" VARCHAR(25) NOT NULL
);

-- CreateTable
CREATE TABLE "pruefungen" (
    "id" SERIAL NOT NULL,
    "objektID" INTEGER,
    "userID" INTEGER NOT NULL,
    "timestamp" VARCHAR(20) NOT NULL
);

-- CreateTable
CREATE TABLE "pruefungenListe" (
    "id" SERIAL NOT NULL,
    "rauchmelderID" INTEGER NOT NULL,
    "selberRaum" BOOLEAN NOT NULL,
    "baulichUnveraendert" BOOLEAN NOT NULL,
    "hindernisseUmgebung" BOOLEAN NOT NULL,
    "relevanteBeschaedigung" BOOLEAN NOT NULL,
    "oeffnungenFrei" BOOLEAN NOT NULL,
    "warnmelderGereinigt" BOOLEAN NOT NULL,
    "pruefungErfolgreich" BOOLEAN NOT NULL,
    "batterieGut" BOOLEAN NOT NULL,
    "timestamp" VARCHAR(50) NOT NULL,
    "pruefungsID" INTEGER NOT NULL,
    "grund" INTEGER NOT NULL,
    "anmerkungen" VARCHAR(100) NOT NULL,
    "anmerkungenZwei" VARCHAR(100) NOT NULL
);

-- CreateTable
CREATE TABLE "rauchmelder" (
    "id" SERIAL NOT NULL,
    "aktuelleHistorienID" INTEGER,
    "wohnungsID" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "rauchmelderhistorie" (
    "id" SERIAL NOT NULL,
    "rauchmelderbz" INTEGER NOT NULL,
    "raum" VARCHAR(150) NOT NULL,
    "seriennr" VARCHAR(10) NOT NULL,
    "produktionsdatum" DATE NOT NULL,
    "installedAt" DATE,
    "outOfOrderAt" DATE,
    "isactive" BOOLEAN DEFAULT false,

    CONSTRAINT "rauchmelderhistorie_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_role_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "admin" BOOLEAN,
    "salt" VARCHAR,
    "email" VARCHAR,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "wohnungen" (
    "id" SERIAL NOT NULL,
    "objektID" INTEGER NOT NULL,
    "etage" VARCHAR(20) NOT NULL,
    "wohnungslage" VARCHAR(20) NOT NULL,
    "haus" VARCHAR(20) NOT NULL,
    "vorname" VARCHAR(50) NOT NULL,
    "nachname" VARCHAR(50) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "auftraggeber_un" ON "auftraggeber"("id");

-- CreateIndex
CREATE UNIQUE INDEX "objekte_un" ON "objekte"("id");

-- CreateIndex
CREATE UNIQUE INDEX "pruefungen_un" ON "pruefungen"("id");

-- CreateIndex
CREATE UNIQUE INDEX "pruefungenliste_un" ON "pruefungenListe"("anmerkungenZwei", "id");

-- CreateIndex
CREATE UNIQUE INDEX "rauchmelder_un" ON "rauchmelder"("id");

-- CreateIndex
CREATE UNIQUE INDEX "wohnungen_un" ON "wohnungen"("id");

-- AddForeignKey
ALTER TABLE "chatteilnehmer" ADD CONSTRAINT "chatteilnehmer_fk" FOREIGN KEY ("userid") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chatteilnehmer" ADD CONSTRAINT "chatteilnehmer_fk_1" FOREIGN KEY ("chatid") REFERENCES "chats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nachrichten" ADD CONSTRAINT "nachrichten_fk" FOREIGN KEY ("userid") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nachrichten" ADD CONSTRAINT "nachrichten_fk_1" FOREIGN KEY ("chatid") REFERENCES "chats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "objekte" ADD CONSTRAINT "objekte_fk" FOREIGN KEY ("auftraggeberID") REFERENCES "auftraggeber"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pruefungen" ADD CONSTRAINT "pruefungen_fk" FOREIGN KEY ("objektID") REFERENCES "objekte"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pruefungen" ADD CONSTRAINT "pruefungen_fk_1" FOREIGN KEY ("userID") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pruefungenListe" ADD CONSTRAINT "pruefungenliste_fk" FOREIGN KEY ("pruefungsID") REFERENCES "pruefungen"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pruefungenListe" ADD CONSTRAINT "pruefungenliste_fk1" FOREIGN KEY ("rauchmelderID") REFERENCES "rauchmelderhistorie"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rauchmelder" ADD CONSTRAINT "rauchmelder_fk" FOREIGN KEY ("aktuelleHistorienID") REFERENCES "rauchmelderhistorie"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rauchmelder" ADD CONSTRAINT "rauchmelder_fk_1" FOREIGN KEY ("wohnungsID") REFERENCES "wohnungen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rauchmelderhistorie" ADD CONSTRAINT "rauchmelderhistorie_fk" FOREIGN KEY ("rauchmelderbz") REFERENCES "rauchmelder"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wohnungen" ADD CONSTRAINT "wohnungen_fk" FOREIGN KEY ("objektID") REFERENCES "objekte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

