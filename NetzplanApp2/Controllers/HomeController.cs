using System.Diagnostics;
using CsvHelper.Configuration;
using CsvHelper;
using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using NetzplanApp2.Models;
using System.Text.Json;

namespace NetzplanApp2.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController( ILogger<HomeController> logger )
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Netzplan( string csv , string option )
    {
        if ( csv is null )
            return View( "Error" , "Datei konnte nicht verarbeitet werden" );

        if ( csv.Length == 0 )
            return View( "Error" , "Datei ist leer" );

        using ( var reader = new StringReader( csv ) )
        {
            var csvReader = new CsvReader( reader , new CsvConfiguration( CultureInfo.InvariantCulture )
            {
                Delimiter = ";"
            } );
            var records = csvReader.GetRecords<Node>().ToList();

            if ( records [ 0 ].Vorg�nger != "-" )
                return View( "Error" , "Der Vorg�nger der ersten Node muss \"-\" sein" );

            List<Node> recordCheck = new();

            for ( int i = 0 ; i < records.Count ; i++ )
            {
                recordCheck.Add( records [ i ] );

                if ( i != 0 )
                {
                    var previous = records [ i ].Vorg�nger.Split( "," );
                    foreach ( var item in previous )
                    {
                        item.Trim();

                        if ( !recordCheck.Select( x => x.Vorgang ).Contains( item ) )
                            return View( "Error" , $"Der Vorg�nger {item} des Vorgangs {records [ i ].Vorgang} existiert nicht vor {records [ i ].Vorgang}" );
                    }
                }
            }

            var model = NetzplanBerechnen( records );

            var jsonmodel = JsonSerializer.Serialize( model );

            ViewBag.Direction = option;

            return View( model: jsonmodel );
        }
    }

    [ResponseCache( Duration = 0 , Location = ResponseCacheLocation.None , NoStore = true )]
    public IActionResult Error()
    {
        return View( new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier } );
    }

    private List<NodeDTO> NetzplanBerechnen( List<Node> nodes )
    {
        List<NodeDTO> nodeDTOs = new();

        // Forward Calculation
        foreach ( var node in nodes )
        {
            var dto = new NodeDTO
            {
                Vorgang = node.Vorgang ,
                Beschreibung = node.Beschreibung ,
                Dauer = node.Dauer ,
                Vorg�nger = new List<NodeDTO>()
            };

            if ( node.Vorg�nger == "-" )
            {
                dto.FAZ = 0;
                dto.FEZ = dto.FAZ + node.Dauer;
            }
            else
            {
                var prev = node.Vorg�nger.Split( ',' ).Select( x => x.Trim() ).ToArray();
                var predecessors = nodeDTOs.Where( x => prev.Contains( x.Vorgang ) ).ToList();

                dto.Vorg�nger = predecessors;
                dto.FAZ = predecessors.Any() ? predecessors.Max( x => x.FEZ ) : 0;
                dto.FEZ = dto.FAZ + node.Dauer;
            }

            nodeDTOs.Add( dto );
        }

        // Backward Calculation
        for ( int i = nodeDTOs.Count - 1 ; i >= 0 ; i-- )
        {
            var node = nodeDTOs [ i ];

            var successors = nodeDTOs.Where( n => n.Vorg�nger.Any( v => v.Vorgang == node.Vorgang ) ).ToList();

            node.SEZ = successors.Any() ? successors.Min( n => n.SAZ ) : node.FEZ;
            node.SAZ = node.SEZ - node.Dauer;
            node.FP = successors.Any() ? successors.Min( n => n.FAZ ) - node.FEZ : 0;
            node.GP = node.SEZ - node.FEZ;
            node.Critical = node.GP == 0;
        }

        return nodeDTOs;
    }
}