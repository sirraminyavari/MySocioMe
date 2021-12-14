/*
 * class Geometry is used to do calculation about locations such as
 * distance determination, bearing determination 
 * and for determine latitude and longitude of destination giving latitude, longitude, bearing and distance
*/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MySocioMe.Web.Util
{
    public class Geometry
    {
        public static double EARTH_RADIUS = 6371000;

        //function distance, calculates distance giving latitude and longitude of two locations
        public static double distance(double srcLatitude, double srcLongitude, double destLatitude, double destLongitude)
        {
            double teta = destLongitude - srcLongitude;

            return Math.Acos((Math.Sin(srcLatitude) * Math.Sin(destLatitude)) + 
                (Math.Cos(srcLatitude) * Math.Cos(destLatitude) * Math.Cos(teta))) * EARTH_RADIUS;
        }

        //function bearing is used to calculate the start bearing giving to locations
        public static double bearing(double srcLatitude, double srcLongitude, double destLatitude, double destLongitude)
        {
            double teta = destLongitude - srcLongitude;

            double y = Math.Sin(teta) * Math.Cos(destLatitude);
            double x = (Math.Cos(srcLatitude) * Math.Sin(destLatitude)) - 
                (Math.Sin(srcLatitude) * Math.Cos(destLatitude) * Math.Cos(teta));

            return ((Math.Atan2(y, x) * (double)180) / Math.PI) + (double)180;
        }

        //function destination, is used to find latitude and longitude of destination
        //giving latitude, longitude, bearing and distance of a location
        public static void destination(double latitude, double longitude, double bearing, double distance,
            ref double destLatitude, ref double destLongitude)
        {
            double d = distance / EARTH_RADIUS;

            destLatitude = Math.Asin((Math.Sin(latitude) * Math.Cos(d)) +
                (Math.Cos(latitude) * Math.Sin(d) * Math.Cos(bearing)));

            destLongitude = longitude + Math.Atan2(Math.Sin(bearing) * Math.Sin(d) * Math.Cos(latitude),
                Math.Cos(d) - (Math.Sin(latitude) * Math.Sin(destLatitude)));
        }
    }
}