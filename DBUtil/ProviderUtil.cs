using System;
using System.Collections.Generic;
using System.Linq;
using System.Data;
using Microsoft.ApplicationBlocks.Data;

namespace DBUtil
{
    public static class ProviderUtil
    {
        private static string _connectionString;
        public static string ConnectionString
        {
            get
            {
                if (string.IsNullOrEmpty(_connectionString))
                    _connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString;
                return _connectionString;
            }
        }
        
        public static string get_search_text(string searchText, bool startWith = true)
        {
            if (string.IsNullOrEmpty(searchText)) return searchText;
            string[] words = searchText.Split(' ');
            List<string> lstWords = new List<string>();

            for (int i = 0; i < words.Count(); ++i)
                if (!string.IsNullOrEmpty(words[i].Trim())) lstWords.Add(words[i].Trim());

            searchText = "ISABOUT(";
            for (int i = 0, _count = lstWords.Count; i < _count; ++i)
                searchText += (i == 0 ? string.Empty : ",") + "\"" + lstWords[i] + (startWith ? "*" : "") + 
                    "\" WEIGHT(" + (i > 4 ? 0.1 : 1 - (i * 0.2)).ToString() + ")";
            searchText += ")";
            
            return searchText;
        }

        public static string get_tags_text(List<string> tags)
        {
            if (tags == null) return string.Empty;

            string strTags = string.Empty;

            bool isFirst = true;
            foreach (string _t in tags)
            {
                strTags += (isFirst ? string.Empty : " ~ ") + _t;
                isFirst = false;
            }

            return strTags;
        }

        public static List<string> get_tags_list(string strTags, char delimiter = '~')
        {
            if (string.IsNullOrEmpty(strTags)) return new List<string>();
            List<string> tags = strTags.Split(delimiter).ToList();

            List<string> retList = new List<string>();

            foreach (string _t in tags)
            {
                if (string.IsNullOrEmpty(_t.Trim())) continue;
                retList.Add(_t.Trim());
            }

            return retList;
        }

        public static bool succeed(IDataReader reader, ref string errorMessage)
        {
            try
            {
                reader.Read();

                try { return (bool)reader[0]; }
                catch { }

                try { if (reader.FieldCount > 1) errorMessage = reader[1].ToString(); }
                catch { }

                bool result = long.Parse(reader[0].ToString()) > 0 ? true : false;
                
                return result;
            }
            catch { return false; }
            finally { if (!reader.IsClosed) reader.Close(); }
        }
        
        public static bool succeed(IDataReader reader)
        {
            string msg = string.Empty;
            return succeed(reader, ref msg);
        }

        public static int succeed_int(IDataReader reader, ref string errorMessage)
        {
            try
            {
                reader.Read();

                try { if (reader.FieldCount > 1) errorMessage = reader[1].ToString(); }
                catch { }

                return int.Parse(reader[0].ToString());
            }
            catch { return 0; }
            finally { if (!reader.IsClosed) reader.Close(); }
        }

        public static int succeed_int(IDataReader reader)
        {
            string msg = string.Empty;
            return succeed_int(reader, ref msg);
        }

        public static long succeed_long(IDataReader reader, ref string errorMessage)
        {
            try
            {
                reader.Read();

                try { if (reader.FieldCount > 1) errorMessage = reader[1].ToString(); }
                catch { }

                return long.Parse(reader[0].ToString());
            }
            catch { return 0; }
            finally { if (!reader.IsClosed) reader.Close(); }
        }

        public static long succeed_long(IDataReader reader)
        {
            string msg = string.Empty;
            return succeed_long(reader, ref msg);
        }

        public static string succeed_string(IDataReader reader, ref string errorMessage)
        {
            try
            {
                reader.Read();

                try { if (reader.FieldCount > 1) errorMessage = reader[1].ToString(); }
                catch { }

                return reader[0].ToString();
            }
            catch { return null; }
            finally { if (!reader.IsClosed) reader.Close(); }
        }

        public static string succeed_string(IDataReader reader)
        {
            string msg = string.Empty;
            return succeed_string(reader, ref msg);
        }

        public static Guid succeed_guid(IDataReader reader, ref string errorMessage)
        {
            try
            {
                reader.Read();

                try { if (reader.FieldCount > 1) errorMessage = reader[1].ToString(); }
                catch { }

                return Guid.Parse(reader[0].ToString());
            }
            catch { return Guid.Empty; }
            finally { if (!reader.IsClosed) reader.Close(); }
        }

        public static Guid succeed_guid(IDataReader reader)
        {
            string msg = string.Empty;
            return succeed_guid(reader, ref msg);
        }

        public static DateTime? succeed_datetime(IDataReader reader, ref string errorMessage)
        {
            try
            {
                reader.Read();

                try { if (reader.FieldCount > 1) errorMessage = reader[1].ToString(); }
                catch { }

                return DateTime.Parse(reader[0].ToString());
            }
            catch { return null; }
            finally { if (!reader.IsClosed) reader.Close(); }
        }

        public static DateTime? succeed_datetime(IDataReader reader)
        {
            string msg = string.Empty;
            return succeed_datetime(reader, ref msg);
        }
        
        public static void parse_guids(ref IDataReader reader, ref List<Guid> lstGuids, ref long totalCount)
        {
            while (reader.Read())
            {
                try { if (!string.IsNullOrEmpty(reader["ID"].ToString())) lstGuids.Add((Guid)reader["ID"]); }
                catch { }
            }

            if (reader.NextResult()) totalCount = ProviderUtil.succeed_long(reader);
            else if (!reader.IsClosed) reader.Close();
        }

        public static void parse_guids(ref IDataReader reader, ref List<Guid> lstGuids)
        {
            long totalCount = 0;
            parse_guids(ref reader, ref lstGuids, ref totalCount);
        }

        public static void parse_guids(IDataReader reader, ref List<Guid> lstGuids)
        {
            parse_guids(ref reader, ref lstGuids);
        }

        public static void parse_guids(IDataReader reader, ref List<Guid> lstGuids, ref long totalCount)
        {
            parse_guids(ref reader, ref lstGuids, ref totalCount);
        }

        public static void parse_strings(ref IDataReader reader, ref List<string> lstString)
        {
            while (reader.Read())
            {
                try { if (!string.IsNullOrEmpty(reader["Value"].ToString())) lstString.Add((string)reader["Value"]); }
                catch { }
            }

            if (!reader.IsClosed) reader.Close();
        }
        
        public static IDataReader execute_reader(string spName, params object[] parameterValues)
        {
            return (IDataReader)SqlHelper.ExecuteReader(ProviderUtil.ConnectionString, spName, parameterValues);
        }

        public static object execute_scalar(string spName, params object[] parameterValues)
        {
            return SqlHelper.ExecuteScalar(ProviderUtil.ConnectionString, spName, parameterValues);
        }
    }
}
