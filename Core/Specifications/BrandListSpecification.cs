using Core.Entities;

namespace Core.Specifications;

public class BrandListSpecification : BaseSpecfication<Product, string>
{
  public BrandListSpecification()
  {
    AddSelect(p => p.Brand);
    ApplyDistinct();
   }
}
