import React from "react";
import { Card, CardBody } from "reactstrap";

function AppFooter() {
  return (
    <Card className="customFooter">
      <CardBody className="text-center">
        <br></br>
        <span className="text-muted"> Steam Visualizer</span>
        <br></br>
      </CardBody>
    </Card>
  );
}

export default AppFooter;
