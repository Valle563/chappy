Databasdesign för Chappy

Chappy använder en DynamoDB-tabell som heter chappy. All data ligger i samma tabell.
pk är mappen en rad hör till. sk säger vad raden är i mappen och sorterar raderna.

Användare: pk USER#alex, sk PROFILE. Fält: passwordHash.
Kanal: pk CHANNEL#allmänt, sk meta. Fält: isLocked, createdBy.
Meddelande i kanal: pk CHANNEL#allmänt, sk MSG# + tid. Fält: sender, text.
DM-meddelande: pk DM#alex#maja, sk MSG# + tid. Fält: sender, text.

Tiden skrivs som ISO-datum, till exempel 2026-10-30T09:12:00.000Z, så att meddelandena sorteras rätt.
I DM står namnen i pk alltid i bokstavsordning, så att båda hamnar i samma konversation.
En låst kanal kräver bara inloggning, så det finns ingen medlemslista.

Frågor:
Logga in: GetCommand på USER#alex och PROFILE.
Registrera: PutCommand som bara går igenom om användaren inte finns.
Alla användare: ScanCommand med filter sk = PROFILE.
Alla kanaler: ScanCommand med filter sk = meta.
Meddelanden i kanal eller DM: QueryCommand på pk, där sk börjar med MSG#.

Val: gäster skriver som Gäst. Scan går bra eftersom datamängden är liten.
