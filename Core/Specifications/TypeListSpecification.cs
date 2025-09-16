using Core.Entities;

namespace Core.Specifications;

public class TypeListSpecification : BaseSpecfication<Product, string>
{
  public TypeListSpecification()
  {
    AddSelect(p => p.Type);
    ApplyDistinct();
  }
}
