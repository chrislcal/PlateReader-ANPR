const express = require('express');
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());



app.get('/cardata', async (req, res) => {
    
    try {
        const plateNumber = req.query.plateNumber;
        console.log(`Received on server: ${plateNumber}`);

        const request = await fetch(
            `https://kjoretoyoppslag.atlas.vegvesen.no/ws/no/vegvesen/kjoretoy/kjoretoyoppslag/v1/oppslag/raw/${plateNumber}`,
        );
        const data = await request.json();

        const carDetails = {
            brand: data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.generelt.merke[0].merke,
            make: data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.generelt.handelsbetegnelse[0],
            year: data.kjoretoy.godkjenning.tekniskGodkjenning.kjoretoyklassifisering.nasjonalGodkjenningnasjonaltGodkjenningsAr,
            cylinder: data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.motorOgDrivverk.motor[0].slagvolum + "L",
            fuel: data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.miljodata.miljoOgdrivstoffGruppe[0].drivstoffKodeMiljodata.kodeBeskrivelse,
            transmission: data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.motorOgDrivverk.girkassetype.kodeBeskrivelse,
            maxSpeed: data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.motorOgDrivverk.maksimumHastighet[0],
            width: data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.dimensjoner.bredde,
            length: data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.dimensjoner.lengde, 
            wheelDrive: data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.akslinger.antallAksler, 
            color: data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.karosseriOgLasteplan.rFarge[0].kodeNavn
        };

        res.json(carDetails);

    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
})