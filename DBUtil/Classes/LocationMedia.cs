using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class LocationMedia
    {
        public Media Media;
        public BookmarkedLocation Location;

        public LocationMedia() {
            Media = new Media();
            Location = new BookmarkedLocation();
        }
    }
}
