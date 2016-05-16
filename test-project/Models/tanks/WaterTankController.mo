within Tanks.Examples;

model WaterTankController
  Modelica.Blocks.Interfaces.RealOutput wt3_valve(start = 0.0) annotation(Placement(visible = true, transformation(origin = {108, 0}, extent = {{-10, -10}, {10, 10}}, rotation = 0), iconTransformation(origin = {108, 0}, extent = {{-10, -10}, {10, 10}}, rotation = 0)));
  parameter Real wt3_max = 2.0;
  parameter Real wt3_min = 1.0;
  Modelica.Blocks.Interfaces.RealInput wt3_level annotation(Placement(visible = true, transformation(origin = {-106, -2}, extent = {{-20, -20}, {20, 20}}, rotation = 0), iconTransformation(origin = {-96, -2}, extent = {{-20, -20}, {20, 20}}, rotation = 0)));
equation
  // Simple standalone controller for testing purposes
  wt3_valve = if wt3_level >= wt3_max then 1.0 else 0.0;
  annotation(Icon(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2, 2}), graphics = {Text(origin = {6, -1}, extent = {{-74, 43}, {74, -41}}, textString = "Controller"), Rectangle(origin = {0, 1}, extent = {{-100, 35}, {100, -35}})}), Diagram(coordinateSystem(extent = {{-100, -100}, {100, 100}}, preserveAspectRatio = true, initialScale = 0.1, grid = {2, 2})));
end WaterTankController;