using System.ComponentModel.DataAnnotations;

namespace api.Models.Validation
{
    public class CoordinateValidationAttribute : ValidationAttribute
    {
        private readonly double _min;
        private readonly double _max;

        public CoordinateValidationAttribute(double min, double max)
        {
            _min = min;
            _max = max;
        }

        public override bool IsValid(object? value)
        {
            if (value is not float coordinate)
                return false;

            return coordinate >= _min && coordinate <= _max;
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} must be between {_min} and {_max}.";
        }
    }

    public class LatitudeValidationAttribute : CoordinateValidationAttribute
    {
        public LatitudeValidationAttribute()
            : base(-90, 90) { }
    }

    public class LongitudeValidationAttribute : CoordinateValidationAttribute
    {
        public LongitudeValidationAttribute()
            : base(-180, 180) { }
    }
}
