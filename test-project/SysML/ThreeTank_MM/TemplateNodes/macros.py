##
# All functions defined in this file will be available in the Template Editor.
# To use a function named 'test' in a production node, use '$test()' in the 
# production node text. The '$test()' token will be replaced by the text returned 
# by the evaluation of the corresponding python 'test' method defined in this file.
#

from org.modelio.metamodel.uml.infrastructure import ModelElement

##
# Example of python function ready to use in a Template.
# For a stereotyped element, returns the label of the first stereotype
# (or its name if no label is defined).
# If the element is not stereotyped, its standard metaclass name is returned.
#
def metaclassName(element):
  if isinstance(element, ModelElement):
    for stereotype in element.getExtension():
      if stereotype.getLabel() != "":
        return stereotype.getLabel()
      else:
        return stereotype.getName()
  return element.getMClass().getName()

def PropertyName(element):
  table = element.getAnalystProperties()
  properties = table.getType().getOwned()
  property = properties.get(index)
  return property.getName()
  

def PropertyValue(element):
  table = element.getAnalystProperties()
  properties = table.getType().getOwned()
  property = properties.get(index)
  return table.getProperty(property)

