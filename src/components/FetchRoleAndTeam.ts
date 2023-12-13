import React, { useEffect, useState } from 'react';
import { SERVER_BASE_URL } from '../constants/urles';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface UserTeamInfo {
  teamNo?: number;
  roleName?: number;
  userId?:number;
  teamName:string;
}

const UseUserTeamInfo = (userId: number): UserTeamInfo => {
  const [userTeamInfo, setUserTeamInfo] = useState<UserTeamInfo>({
    teamName:"",
    roleName:0,
    userId:0,
    teamNo:0
  });

  const params = useParams();
  const { token } = useSelector((state: any) => state.userToken);
  console.log("sdlkf",userId)
  useEffect(() => {
    const fetchTeamData = async (): Promise<void> => {
      try {
        const response = await fetch(`${SERVER_BASE_URL}/teams/participate`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid": `${params.id}`
          }
        });

        if (!response.ok) {
          console.error("Fetch failed:", response);
          return;
        }

        const teamsData = await response.json();

        const userTeam = findUserTeam(teamsData.data, userId);
        console.log(userTeam,"userTeam")
        if (userTeam) {
          setUserTeamInfo({
            teamNo: userTeam.team.id,
            teamName:userTeam.team.name,
            roleName: userTeam.team.participates?.find((participant:any) => participant.userId === userId)?.roleId,
            userId: userTeam.team.participates?.find((participant:any) => participant.userId == userId)?.userId
          });
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };

    fetchTeamData();
  }, [userId, params.id, token]);


  const findUserTeam = (teams: any[], userId: number): any | undefined => {
    for (const team of teams) {
      const participant = team.participates.find(
        (p: any) => p?.userId === userId
      );
      if (participant) {
        return { team, participant };
      }
    }
  
    return undefined;
  };
  

  return userTeamInfo;
};

export default UseUserTeamInfo;
