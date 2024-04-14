import React, { useMemo, useState } from "react";
import './SidePanelComponent.css';
import ModelsComponent from "../ModelsComponent/ModelsComponent";
import SubjectsComponent from "../SubjectsComponent/SubjectsComponent";
import PropertiesComponent from "../PropertiesComponent/PropertiesComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faPhoneVolume } from "@fortawesome/free-solid-svg-icons";

const SidePanelComponent = (props) => {
    const [activeTab, setActiveTab] = useState('subjects');
    const tabs = useMemo(() => [
        {
            id: 'subjects',
            title: 'טאב 1',
            component: <SubjectsComponent />
        },
        {
            id: 'properties',
            title: 'טאב 2',
            component: <PropertiesComponent />
        },
        {
            id: 'models',
            title: 'טאב 3' ,
            component: <ModelsComponent />
        },
    ], []);
    const activeComponent = useMemo(() => {
        const currentTab = tabs.find(({id}) => id === activeTab);

        return currentTab.component;
    }, [activeTab, tabs]);

    const [displaySidePanel, setDisplaySidePanel] = useState(false);

    return (
        <>
            <FontAwesomeIcon 
                icon={faPhoneVolume}
                className="fa-lg button"
                onClick={() => setDisplaySidePanel(true)}
                style={{ display: displaySidePanel ? 'none' : 'block'}}
            />
            <div className="side-panel" style={{ display: displaySidePanel ? 'block' : 'none'}}>
                <div className="side-panel-top">
                    <FontAwesomeIcon 
                        icon={faArrowRight}
                        className="fa-lg button"
                        onClick={() => setDisplaySidePanel(false)}    
                    />
                    <ul className="side-panel-tabs">
                        {
                            tabs.map((tab) => {
                                return (
                                    <li 
                                        key={tab.id}
                                        id={tab.id}
                                        className={activeTab === tab.id ? "side-panel-tab-item side-panel-tab-item-active" : "side-panel-tab-item"}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        {tab.title}
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
                <div className="side-panel-content">
                    {activeComponent}
                </div>
            </div>
        </>
    );
};

export default SidePanelComponent;