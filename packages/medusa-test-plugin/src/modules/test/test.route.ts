import { Response } from "express";
import { Router } from "medusa-extender";

@Router({
    routes: [
        {
            requiredAuth: false,
            path: "/admin/custom-route/",
            method: "get",
            handlers: [
                (req, res: Response) => {
                    res.json({
                        test: "NICE"
                    });
                }
            ]
        }
    ]
})
export class TestRouter {}
