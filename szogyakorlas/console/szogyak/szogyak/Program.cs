using szogyak;

var rows = File.ReadAllLines("szo10000.txt");
var words = new List<Szo>();

foreach (var row in rows.Skip(1))
{
    var items = row.Split("\t");
    words.Add(new Szo
    {
        Azon = int.Parse(items[0]),
        Szoto = items[1],
        Szofaj = items[2],
        Gyakori = int.Parse(items[3]),
    });
}

var csv = new List<string>();
csv.Add("azon,szoto,szofaj,gyakori");

words.ForEach(w => csv.Add($"{w.Azon},{w.Szoto},{w.Szofaj},{w.Gyakori}"));

File.WriteAllLines("szo10000.csv",csv);

var leggyakoribb = new List<string>();
leggyakoribb.Add("szofaj,1,2,3,4,5,6,7,8,9,10");

var szofajGroups = words.GroupBy(w => w.Szofaj);

foreach (var szofaj in szofajGroups)
{
    var top10 = szofaj.OrderByDescending(a => a.Gyakori).Take(10).Select(w => w.Szoto);
    leggyakoribb.Add($"{szofaj.Key},{string.Join(",", top10)}");
}

File.WriteAllLines("leggyakoribb.csv", leggyakoribb);